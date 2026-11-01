using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Payments;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class VietQrServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly VietQrService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public VietQrServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _service = new VietQrService(_context);
    }

    [Fact]
    public async Task GenerateInvoiceVietQr_ReturnsValidNapasPayloadAndUrl()
    {
        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            InvoiceCode = "HD-2026-0001",
            TotalAmountVnd = 5000000m,
            Status = PaymentStatus.Pending
        };
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        var result = await _service.GenerateInvoiceVietQrAsync(invoice.Id);

        result.InvoiceCode.Should().Be("HD-2026-0001");
        result.AmountVnd.Should().Be(5000000m);
        result.QrImageUrl.Should().Contain("vietqr.io");
        result.QrImageUrl.Should().Contain("5000000");
        result.QrCodeText.Should().StartWith("000201");
    }

    [Fact]
    public async Task ProcessBankingWebhook_WithValidMatchingContent_UpdatesInvoiceToPaid()
    {
        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            InvoiceCode = "HD-2026-0099",
            TotalAmountVnd = 12500000m,
            Status = PaymentStatus.Pending
        };
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        var payload = new BankingWebhookPayloadDto
        {
            TransactionId = "VCB-TX-20261101-99881",
            IdempotencyKey = "IDEM-KEY-0099",
            BankCode = "VCB",
            AccountNumber = "1028491823",
            AmountVnd = 12500000m,
            Content = "Thanh toan cuoc van tai VDBUS HD-2026-0099",
            TransactionDateUtc = DateTime.UtcNow
        };

        var result = await _service.ProcessBankingWebhookAsync(payload);

        result.Success.Should().BeTrue();
        result.IsAlreadyProcessed.Should().BeFalse();
        result.InvoiceCode.Should().Be("HD-2026-0099");

        var updatedInvoice = await _context.Invoices.FindAsync(invoice.Id);
        updatedInvoice!.Status.Should().Be(PaymentStatus.Paid);
        updatedInvoice.PaymentReference.Should().Be("VCB-TX-20261101-99881");
    }

    [Fact]
    public async Task ProcessBankingWebhook_WhenDuplicateTransactionSent_IsIdempotent()
    {
        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            InvoiceCode = "HD-2026-0100",
            TotalAmountVnd = 3500000m,
            Status = PaymentStatus.Paid,
            PaymentReference = "VCB-TX-DUPLICATE-01"
        };
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        var payload = new BankingWebhookPayloadDto
        {
            TransactionId = "VCB-TX-DUPLICATE-01",
            IdempotencyKey = "IDEM-DUPLICATE-01",
            BankCode = "VCB",
            AmountVnd = 3500000m,
            Content = "Thanh toan HD-2026-0100"
        };

        var result = await _service.ProcessBankingWebhookAsync(payload);

        result.Success.Should().BeTrue();
        result.IsAlreadyProcessed.Should().BeTrue();
        result.Message.Should().Contain("Idempotent response");
    }
}
