using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Fuel;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class FuelServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly FuelService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public FuelServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _service = new FuelService(_context, mockTenant.Object);
    }

    [Fact]
    public async Task CreateFuelRecord_WithNormalFueling_CalculatesTotalAndNormalStatus()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "43C-189.24",
            MakeModel = "Hino 500 FG",
            FuelConsumptionLitrePer100Km = 18.5m
        };
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        var request = new CreateFuelRecordRequestDto
        {
            VehicleId = vehicle.Id,
            OdometerKm = 12000m,
            FuelLitre = 100m,
            UnitPriceVnd = 24000m,
            StationName = "Cửa hàng xăng dầu 12",
            SensorLitreBeforeRefuel = 30m,
            SensorLitreAfterRefuel = 129m // Tăng 99L so với 100L trên hóa đơn (sai lệch 1%)
        };

        var result = await _service.CreateFuelRecordAsync(request);

        result.TotalAmountVnd.Should().Be(2400000m);
        result.AbnormalityScore.Should().BeLessThan(0.20);
        result.ConfidenceRating.Should().BeGreaterThan(0.90);
    }

    [Fact]
    public async Task CreateFuelRecord_WhenSensorLitreDiffersSignificantly_TriggersHighAbnormalityScore()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "43H-012.88",
            MakeModel = "Hyundai HD320",
            FuelConsumptionLitrePer100Km = 32.0m
        };
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        var request = new CreateFuelRecordRequestDto
        {
            VehicleId = vehicle.Id,
            OdometerKm = 35000m,
            FuelLitre = 150m,
            UnitPriceVnd = 24000m,
            StationName = "Trạm xăng dầu Quốc lộ 1A",
            SensorLitreBeforeRefuel = 50m,
            SensorLitreAfterRefuel = 140m // Cảm biến chỉ tăng 90L, trong khi hóa đơn tính tiền 150L (lệch 40%)
        };

        var result = await _service.CreateFuelRecordAsync(request);

        result.AbnormalityScore.Should().BeGreaterThanOrEqualTo(0.50);
        result.AbnormalityReason.Should().Contain("chenh lech dang ke");
    }

    [Fact]
    public async Task GetVehicleConsumptionSummary_CalculatesActualRateAndVarianceAccurately()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "92C-156.40",
            MakeModel = "Thaco Auman C160",
            FuelConsumptionLitrePer100Km = 20.0m
        };
        _context.Vehicles.Add(vehicle);

        var fromUtc = DateTime.UtcNow.AddDays(-10);
        var toUtc = DateTime.UtcNow;

        // Lần đổ 1: Odo 10,000 km, 80L
        _context.FuelRecords.Add(new FuelRecord
        {
            TenantId = _tenantId,
            VehicleId = vehicle.Id,
            OdometerKm = 10000m,
            FuelLitre = 80m,
            UnitPriceVnd = 24000m,
            TotalAmountVnd = 1920000m,
            PurchasedAtUtc = fromUtc.AddDays(1)
        });

        // Lần đổ 2: Odo 10,400 km (+400km), đổ 100L => Tiêu hao = (180 / 400) * 100 = 45 L/100km
        _context.FuelRecords.Add(new FuelRecord
        {
            TenantId = _tenantId,
            VehicleId = vehicle.Id,
            OdometerKm = 10400m,
            FuelLitre = 100m,
            UnitPriceVnd = 24000m,
            TotalAmountVnd = 2400000m,
            PurchasedAtUtc = fromUtc.AddDays(5)
        });

        await _context.SaveChangesAsync();

        var summary = await _service.GetVehicleConsumptionSummaryAsync(vehicle.Id, fromUtc, toUtc);

        summary.TotalDistanceKm.Should().Be(400m);
        summary.TotalFuelLitre.Should().Be(180m);
        summary.ActualConsumptionLitrePer100Km.Should().Be(45.0m);
        summary.VariancePercentage.Should().BeGreaterThan(100m); // 45 so với 20 là tăng 125%
        summary.EvaluationStatus.Should().Be("HighVariance");
    }
}
