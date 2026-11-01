using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.PnL;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class PnLServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly PnLService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public PnLServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _service = new PnLService(_context);
    }

    [Fact]
    public async Task GetOverallPnLSummary_CalculatesRevenueCostsAndMarginAccurately()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "43C-189.24"
        };
        _context.Vehicles.Add(vehicle);

        var trip = new Trip
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            VehicleId = vehicle.Id,
            TripCode = "CH-2026-001",
            Status = TripStatus.Completed,
            TotalDistanceKm = 100m,
            EstimatedFuelLitre = 20m, // 20 * 24500 = 490.000 VND
            TotalTollAmountVnd = 75000m, // 75.000 VND
            Orders = new List<Order>
            {
                new Order
                {
                    Id = Guid.NewGuid(),
                    TenantId = _tenantId,
                    OrderCode = "DH-001",
                    FreightAmountVnd = 2500000m // Doanh thu: 2.500.000 VND
                }
            }
        };
        _context.Trips.Add(trip);

        // Phí neo xe phát sinh: 150.000 VND
        _context.DetentionRecords.Add(new DetentionRecord
        {
            TenantId = _tenantId,
            VehicleId = vehicle.Id,
            DetentionFeeVnd = 150000m,
            CreatedAtUtc = DateTime.UtcNow
        });

        // Bảo dưỡng: 200.000 VND
        _context.MaintenanceOrders.Add(new MaintenanceOrder
        {
            TenantId = _tenantId,
            VehicleId = vehicle.Id,
            OrderCode = "BD-01",
            TotalCostVnd = 200000m,
            ScheduledDateUtc = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        var filter = new PnLReportFilterDto
        {
            FromUtc = DateTime.UtcNow.AddDays(-7),
            ToUtc = DateTime.UtcNow.AddDays(1)
        };

        var summary = await _service.GetOverallPnLSummaryAsync(filter);

        // Doanh thu: 2.500.000 + 150.000 = 2.650.000 VND
        summary.TotalRevenueVnd.Should().Be(2650000m);
        // Lương tài xế: (100km * 1.500) + 300.000 = 450.000 VND
        summary.DriverWageCostVnd.Should().Be(450000m);
        summary.TollCostVnd.Should().Be(75000m);
        summary.MaintenanceCostVnd.Should().Be(200000m);
        summary.GrossProfitVnd.Should().BeGreaterThan(0m);
        summary.GrossMarginPercentage.Should().BeGreaterThan(30m);
    }
}
