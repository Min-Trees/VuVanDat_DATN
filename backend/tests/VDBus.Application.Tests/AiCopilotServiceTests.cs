using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Copilot;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class AiCopilotServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly AiCopilotService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public AiCopilotServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _service = new AiCopilotService(_context);
    }

    [Fact]
    public async Task AskCopilot_WhenAskingAboutFuel_ReturnsAnalysisWithFuelRecordsCitation()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "43C-189.24"
        };
        _context.Vehicles.Add(vehicle);

        _context.FuelRecords.Add(new FuelRecord
        {
            TenantId = _tenantId,
            VehicleId = vehicle.Id,
            FuelLitre = 120m,
            TotalAmountVnd = 2880000m,
            AbnormalityScore = 0.75,
            AbnormalityReason = "Lệch cảm biến bình dầu 25%",
            PurchasedAtUtc = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        var request = new CopilotQueryRequestDto
        {
            Question = "Tình hình tiêu hao nhiên liệu tháng này thế nào? Có xe nào bất thường không?"
        };

        var response = await _service.AskCopilotAsync(request);

        response.AnswerMarkdown.Should().Contain("Phân tích Tình hình Tiêu thụ Nhiên liệu Đội xe");
        response.AnswerMarkdown.Should().Contain("43C-189.24");
        response.DataSourcesCited.Should().Contain("FuelRecords");
        response.IsReadOnly.Should().BeTrue();
    }

    [Fact]
    public async Task AskCopilot_WhenAskingAboutRevenue_ReturnsInvoicesAndOrdersAnalysis()
    {
        _context.Invoices.Add(new Invoice
        {
            TenantId = _tenantId,
            InvoiceCode = "HD-2026-0001",
            TotalAmountVnd = 15000000m
        });
        await _context.SaveChangesAsync();

        var request = new CopilotQueryRequestDto
        {
            Question = "Báo cáo doanh thu và dòng tiền hiện tại?"
        };

        var response = await _service.AskCopilotAsync(request);

        response.AnswerMarkdown.Should().Contain("Báo cáo Doanh thu & Dòng tiền Vận tải");
        response.DataSourcesCited.Should().Contain("Invoices");
        response.IsReadOnly.Should().BeTrue();
    }
}
