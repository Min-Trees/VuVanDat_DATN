using System;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Payments;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;

namespace VDBus.Application.Services;

public class VietQrService : IVietQrService
{
    private readonly IApplicationDbContext _context;
    private const string DefaultBankBin = "970436"; // Vietcombank BIN
    private const string DefaultAccountNo = "1028491823";
    private const string DefaultAccountName = "CONG TY CP LOGISTICS VDBUS";

    public VietQrService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<VietQrResponseDto> GenerateInvoiceVietQrAsync(Guid invoiceId, CancellationToken ct = default)
    {
        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == invoiceId, ct);
        if (invoice == null)
        {
            throw new KeyNotFoundException($"Khong tim thay hoa don cuoc voi ID: {invoiceId}");
        }

        string description = $"VDBUS {invoice.InvoiceCode}";
        int amountInt = (int)Math.Round(invoice.TotalAmountVnd, 0);

        // Chuẩn URL VietQR QuickLink (NAPAS 247 dynamic payload)
        string qrImageUrl = $"https://img.vietqr.io/image/{DefaultBankBin}-{DefaultAccountNo}-compact2.png?amount={amountInt}&addInfo={Uri.EscapeDataString(description)}&accountName={Uri.EscapeDataString(DefaultAccountName)}";

        // Chuỗi EMVCo Text mô phỏng chuẩn NAPAS VietQR
        string qrCodeText = $"00020101021238540010A00000072701240006{DefaultBankBin}0110{DefaultAccountNo}530370454{amountInt:D}5802VN62{description.Length + 4:D2}08{description.Length:D2}{description}6304ABCD";

        return new VietQrResponseDto
        {
            InvoiceId = invoice.Id,
            InvoiceCode = invoice.InvoiceCode,
            BankCode = "Vietcombank",
            AccountNumber = DefaultAccountNo,
            AccountName = DefaultAccountName,
            AmountVnd = invoice.TotalAmountVnd,
            PaymentDescription = description,
            QrImageUrl = qrImageUrl,
            QrCodeText = qrCodeText,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        };
    }

    public async Task<BankingWebhookResultDto> ProcessBankingWebhookAsync(BankingWebhookPayloadDto payload, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(payload.TransactionId))
        {
            return new BankingWebhookResultDto
            {
                Success = false,
                Message = "Thieu ma giao dich TransactionId tu ngan hang."
            };
        }

        // 1. Kiểm tra Idempotency: Giao dịch đã được xử lý trước đó chưa?
        var existingPaidInvoice = await _context.Invoices
            .FirstOrDefaultAsync(i => i.PaymentReference == payload.TransactionId || 
                                     (i.PaymentReference != null && i.PaymentReference.Contains(payload.IdempotencyKey)), ct);

        if (existingPaidInvoice != null)
        {
            return new BankingWebhookResultDto
            {
                Success = true,
                IsAlreadyProcessed = true,
                MatchedInvoiceId = existingPaidInvoice.Id,
                InvoiceCode = existingPaidInvoice.InvoiceCode,
                Message = "Giao dich da duoc he thong doi soat va ghi nhan truoc do (Idempotent response)."
            };
        }

        // 2. Trích xuất mã hóa đơn từ nội dung chuyển khoản (e.g. "HD-2026-0001" hoặc "VDBUS HD-...")
        string invoiceCodePattern = @"HD-\d{4}-\d+";
        var match = Regex.Match(payload.Content, invoiceCodePattern, RegexOptions.IgnoreCase);

        Invoice? invoice = null;
        if (match.Success)
        {
            string matchedCode = match.Value.ToUpperInvariant();
            invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.InvoiceCode.ToUpper() == matchedCode, ct);
        }

        // Nếu không khớp regex, thử tìm kiếm invoice theo chính xác nội dung
        if (invoice == null)
        {
            invoice = await _context.Invoices
                .FirstOrDefaultAsync(i => payload.Content.Contains(i.InvoiceCode), ct);
        }

        if (invoice == null)
        {
            return new BankingWebhookResultDto
            {
                Success = false,
                Message = $"Khong tim thay hoa don tuong ung voi noi dung chuyen khoan: '{payload.Content}'"
            };
        }

        // 3. Kiểm tra số tiền chuyển khoản có đủ thanh toán hóa đơn không
        if (payload.AmountVnd < invoice.TotalAmountVnd)
        {
            return new BankingWebhookResultDto
            {
                Success = false,
                MatchedInvoiceId = invoice.Id,
                InvoiceCode = invoice.InvoiceCode,
                Message = $"So tien chuyen khoan ({payload.AmountVnd:N0} VND) khong du de thanh toan toan bo hoa don ({invoice.TotalAmountVnd:N0} VND)."
            };
        }

        // 4. Cập nhật trạng thái hóa đơn sang Đã thanh toán (Paid)
        invoice.Status = PaymentStatus.Paid;
        invoice.PaymentDateUtc = payload.TransactionDateUtc;
        invoice.PaymentReference = payload.TransactionId;
        invoice.Notes += $" | Da doi soat qua Webhook VietQR (Ma GD: {payload.TransactionId}, IDEM: {payload.IdempotencyKey})";

        await _context.SaveChangesAsync(ct);

        return new BankingWebhookResultDto
        {
            Success = true,
            IsAlreadyProcessed = false,
            MatchedInvoiceId = invoice.Id,
            InvoiceCode = invoice.InvoiceCode,
            Message = $"Doi soat va thanh toan thanh cong hoa don {invoice.InvoiceCode}."
        };
    }
}
