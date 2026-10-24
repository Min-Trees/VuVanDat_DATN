using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Pod;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Domain.Services;

namespace VDBus.Application.Services;

public class PodService : IPodService
{
    private readonly IApplicationDbContext _context;

    public PodService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PodRecord> SubmitPodAsync(PodSubmissionDto request, CancellationToken ct = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var order = await _context.Orders
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, ct);

        if (order == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy đơn hàng với mã ID: {request.OrderId}");
        }

        // Chống gửi trùng: Kiểm tra đã có PodRecord hay chưa
        var existingPod = await _context.PodRecords
            .AnyAsync(p => p.OrderId == request.OrderId, ct);

        if (existingPod)
        {
            throw new InvalidOperationException("Đơn hàng này đã được xác nhận giao hàng và có biên bản ePOD trước đó.");
        }

        // Tính toán thời gian và mã băm SHA-256 bảo mật
        var timestampUtc = DateTime.UtcNow;
        var hash = ComputePodHash(
            request.OrderId,
            timestampUtc,
            request.RecipientName,
            request.Latitude,
            request.Longitude,
            request.SignatureBase64
        );

        var podRecord = new PodRecord
        {
            TenantId = order.TenantId,
            OrderId = order.Id,
            TripId = order.TripId,
            RecipientName = request.RecipientName.Trim(),
            RecipientPhone = request.RecipientPhone.Trim(),
            SignatureBase64 = request.SignatureBase64,
            PhotoUrl = request.PhotoUrl,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            TimestampUtc = timestampUtc,
            HashSha256 = hash,
            IsVerified = true,
            Notes = request.Notes
        };

        _context.PodRecords.Add(podRecord);

        // Chuyển trạng thái đơn hàng sang Delivered thông qua OrderStateMachine
        OrderStateMachine.Transition(order, OrderStatus.Delivered, UserRole.Driver);

        // Tự động tạo bản ghi Hóa đơn cước nháp (Invoice) phục vụ kế toán đối soát
        var invoiceCode = $"HD-{DateTime.UtcNow:yyyyMM}-{Random.Shared.Next(1000, 9999)}";
        var subtotal = order.FreightAmountVnd;
        var tax = Math.Round(subtotal * 0.08m, 0); // Thuế VAT 8%
        var total = subtotal + tax;

        var invoice = new Invoice
        {
            TenantId = order.TenantId,
            InvoiceCode = invoiceCode,
            CustomerId = order.CustomerId,
            OrderId = order.Id,
            SubtotalVnd = subtotal,
            TaxPercent = 8.0m,
            TaxAmountVnd = tax,
            TotalAmountVnd = total,
            Status = PaymentStatus.Pending,
            IssuedDateUtc = DateTime.UtcNow,
            DueDateUtc = DateTime.UtcNow.AddDays(order.Customer?.PaymentTermDays ?? 30),
            Notes = $"Hóa đơn tự động sinh từ đơn hàng {order.OrderCode} sau khi hoàn tất giao hàng ePOD."
        };

        _context.Invoices.Add(invoice);

        await _context.SaveChangesAsync(ct);
        return podRecord;
    }

    public async Task<PodVerificationDto> VerifyPodIntegrityAsync(Guid orderId, CancellationToken ct = default)
    {
        var pod = await _context.PodRecords
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.OrderId == orderId, ct);

        if (pod == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy chứng từ ePOD cho đơn hàng: {orderId}");
        }

        var calculatedHash = ComputePodHash(
            pod.OrderId,
            pod.TimestampUtc,
            pod.RecipientName,
            pod.Latitude,
            pod.Longitude,
            pod.SignatureBase64
        );

        bool isTamperFree = string.Equals(pod.HashSha256, calculatedHash, StringComparison.OrdinalIgnoreCase);

        return new PodVerificationDto
        {
            OrderId = pod.OrderId,
            PodId = pod.Id,
            OrderCode = pod.Order?.OrderCode ?? string.Empty,
            RecipientName = pod.RecipientName,
            TimestampUtc = pod.TimestampUtc,
            Latitude = pod.Latitude,
            Longitude = pod.Longitude,
            StoredHashSha256 = pod.HashSha256,
            CalculatedHashSha256 = calculatedHash,
            IsTamperFree = isTamperFree
        };
    }

    public string ComputePodHash(
        Guid orderId,
        DateTime timestampUtc,
        string recipientName,
        double lat,
        double lon,
        string signatureBase64)
    {
        // Định dạng payload chuẩn hóa kết hợp các trường khóa để sinh hash
        var rawPayload = $"{orderId:N}|{timestampUtc:O}|{recipientName.Trim()}|{lat:F6}|{lon:F6}|{signatureBase64.Trim()}";
        var bytes = Encoding.UTF8.GetBytes(rawPayload);
        var hashBytes = SHA256.HashData(bytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}
