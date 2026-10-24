using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Pod;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class PodServiceTests
{
    private readonly DbContextOptions<ApplicationDbContext> _dbOptions;

    public PodServiceTests()
    {
        _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task SubmitPodAsync_ShouldUpdateOrderToDeliveredAndCreateInvoice()
    {
        var tenantMock = new Mock<ICurrentTenantService>();
        var tenantId = Guid.NewGuid();
        tenantMock.Setup(s => s.TenantId).Returns(tenantId);
        tenantMock.Setup(s => s.UserId).Returns("driver-01");

        using var context = new ApplicationDbContext(_dbOptions, tenantMock.Object);
        var podService = new PodService(context);

        var orderId = Guid.NewGuid();
        var customerId = Guid.NewGuid();

        var customer = new Customer
            { Id = customerId, TenantId = tenantId, Name = "Unilever", PaymentTermDays = 15 };
        var order = new Order
        {
            Id = orderId,
            TenantId = tenantId,
            CustomerId = customerId,
            OrderCode = "DH-2026-8888",
            FreightAmountVnd = 10000000,
            Status = OrderStatus.InTransitDelivery
        };

        context.Customers.Add(customer);
        context.Orders.Add(order);
        await context.SaveChangesAsync();

        var submission = new PodSubmissionDto
        {
            OrderId = orderId,
            RecipientName = "Nguyễn Văn Nhận",
            RecipientPhone = "0901234567",
            SignatureBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA",
            Latitude = 10.7769,
            Longitude = 106.7009,
            Notes = "Giao đủ 20 kiện nguyên vẹn"
        };

        var podRecord = await podService.SubmitPodAsync(submission);

        podRecord.Should().NotBeNull();
        podRecord.HashSha256.Should().NotBeNullOrEmpty();
        podRecord.RecipientName.Should().Be("Nguyễn Văn Nhận");

        // Kiểm tra order đã chuyển sang Delivered
        var updatedOrder = await context.Orders.FindAsync(orderId);
        updatedOrder!.Status.Should().Be(OrderStatus.Delivered);

        // Kiểm tra hóa đơn cước đã tự động tạo
        var invoice = await context.Invoices.FirstOrDefaultAsync(i => i.OrderId == orderId);
        invoice.Should().NotBeNull();
        invoice!.SubtotalVnd.Should().Be(10000000);
        invoice.TaxAmountVnd.Should().Be(800000); // 8% VAT
        invoice.TotalAmountVnd.Should().Be(10800000);
    }

    [Fact]
    public async Task SubmitPodAsync_DuplicateSubmission_ShouldThrow()
    {
        var tenantMock = new Mock<ICurrentTenantService>();
        var tenantId = Guid.NewGuid();
        tenantMock.Setup(s => s.TenantId).Returns(tenantId);

        using var context = new ApplicationDbContext(_dbOptions, tenantMock.Object);
        var podService = new PodService(context);

        var orderId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var customer = new Customer { Id = customerId, TenantId = tenantId, Name = "Vinamilk" };
        var order = new Order
        {
            Id = orderId,
            TenantId = tenantId,
            CustomerId = customerId,
            Status = OrderStatus.InTransitDelivery
        };
        context.Customers.Add(customer);
        context.Orders.Add(order);
        await context.SaveChangesAsync();

        var submission = new PodSubmissionDto
        {
            OrderId = orderId,
            RecipientName = "Người nhận A",
            SignatureBase64 = "sign-sample-data"
        };

        // Gửi lần 1 -> Thành công
        await podService.SubmitPodAsync(submission);

        // Gửi lần 2 -> Ném ngoại lệ chống trùng
        var act = () => podService.SubmitPodAsync(submission);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*đã được xác nhận giao hàng*");
    }

    [Fact]
    public async Task VerifyPodIntegrity_WhenDataTampered_ShouldDetectTampering()
    {
        var tenantMock = new Mock<ICurrentTenantService>();
        var tenantId = Guid.NewGuid();
        tenantMock.Setup(s => s.TenantId).Returns(tenantId);

        using var context = new ApplicationDbContext(_dbOptions, tenantMock.Object);
        var podService = new PodService(context);

        var orderId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var customer = new Customer { Id = customerId, TenantId = tenantId, Name = "Masan" };
        var order = new Order
        {
            Id = orderId,
            TenantId = tenantId,
            CustomerId = customerId,
            Status = OrderStatus.InTransitDelivery
        };
        context.Customers.Add(customer);
        context.Orders.Add(order);
        await context.SaveChangesAsync();

        await podService.SubmitPodAsync(new PodSubmissionDto
        {
            OrderId = orderId,
            RecipientName = "Họ Tên Thật",
            SignatureBase64 = "original-signature"
        });

        // 1. Kiểm tra khi chưa bị sửa -> Toàn vẹn
        var cleanVerification = await podService.VerifyPodIntegrityAsync(orderId);
        cleanVerification.IsTamperFree.Should().BeTrue();

        // 2. Can thiệp sửa tên người nhận
        var pod = await context.PodRecords.FirstAsync(p => p.OrderId == orderId);
        pod.RecipientName = "Họ Tên Bị Sửa Trái Phép";
        await context.SaveChangesAsync();

        // 3. Kiểm tra lại -> Phát hiện dữ liệu bị sửa (tampered)
        var tamperedVerification = await podService.VerifyPodIntegrityAsync(orderId);
        tamperedVerification.IsTamperFree.Should().BeFalse();
        tamperedVerification.StoredHashSha256.Should().NotBe(tamperedVerification.CalculatedHashSha256);
    }
}
