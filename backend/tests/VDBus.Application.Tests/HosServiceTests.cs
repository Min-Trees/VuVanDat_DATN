using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class HosServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly HosService _hosService;
    private readonly Guid _tenantId = Guid.NewGuid();

    public HosServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _hosService = new HosService(_context);
    }

    [Fact]
    public async Task CalculateHos_WhenContinuousDrivingExceeds240Min_ShouldTriggerViolation()
    {
        var vehicle = new Vehicle { Id = Guid.NewGuid(), TenantId = _tenantId, LicensePlate = "43C-111.11" };
        var driver = new Driver { Id = Guid.NewGuid(), TenantId = _tenantId, FullName = "Nguyen Van A", AssignedVehicleId = vehicle.Id };
        _context.Vehicles.Add(vehicle);
        _context.Drivers.Add(driver);

        var startTime = DateTime.UtcNow.Date.AddHours(8); // 08:00

        // Sinh chuỗi di chuyển 250 phút liên tục (vận tốc 60 km/h)
        for (int m = 0; m <= 250; m += 10)
        {
            _context.TelemetryRecords.Add(new TelemetryRecord
            {
                TenantId = _tenantId,
                VehicleId = vehicle.Id,
                RecordedAtUtc = startTime.AddMinutes(m),
                SpeedKmh = 60.0
            });
        }
        await _context.SaveChangesAsync();

        var result = await _hosService.CalculateDriverHosStatusAsync(driver.Id, startTime.AddMinutes(250));

        result.ContinuousDrivingMinutes.Should().BeGreaterOrEqualTo(240);
        result.AlertLevel.Should().Be(HosAlertLevel.Violation);
        result.AlertMessage.Should().Contain("VI PHẠM");
    }

    [Fact]
    public async Task CalculateHos_WhenContinuousDrivingWithinWarningWindow_ShouldTriggerWarning30Min()
    {
        var vehicle = new Vehicle { Id = Guid.NewGuid(), TenantId = _tenantId, LicensePlate = "43C-222.22" };
        var driver = new Driver { Id = Guid.NewGuid(), TenantId = _tenantId, FullName = "Tran Van B", AssignedVehicleId = vehicle.Id };
        _context.Vehicles.Add(vehicle);
        _context.Drivers.Add(driver);

        var startTime = DateTime.UtcNow.Date.AddHours(8);

        // Lái xe 220 phút (còn 20 phút là chạm 240) -> Nằm trong khoảng (30 min warning)
        for (int m = 0; m <= 220; m += 10)
        {
            _context.TelemetryRecords.Add(new TelemetryRecord
            {
                TenantId = _tenantId,
                VehicleId = vehicle.Id,
                RecordedAtUtc = startTime.AddMinutes(m),
                SpeedKmh = 50.0
            });
        }
        await _context.SaveChangesAsync();

        var result = await _hosService.CalculateDriverHosStatusAsync(driver.Id, startTime.AddMinutes(220));

        result.RemainingContinuousMinutes.Should().BeLessThanOrEqualTo(30);
        result.AlertLevel.Should().Be(HosAlertLevel.Warning30Min);
    }

    [Fact]
    public async Task CalculateHos_WhenRestingForMoreThan15Min_ShouldResetContinuousDriving()
    {
        var vehicle = new Vehicle { Id = Guid.NewGuid(), TenantId = _tenantId, LicensePlate = "43C-333.33" };
        var driver = new Driver { Id = Guid.NewGuid(), TenantId = _tenantId, FullName = "Le Van C", AssignedVehicleId = vehicle.Id };
        _context.Vehicles.Add(vehicle);
        _context.Drivers.Add(driver);

        var startTime = DateTime.UtcNow.Date.AddHours(8);

        // 1. Lái xe 180 phút
        for (int m = 0; m <= 180; m += 10)
        {
            _context.TelemetryRecords.Add(new TelemetryRecord
            {
                TenantId = _tenantId,
                VehicleId = vehicle.Id,
                RecordedAtUtc = startTime.AddMinutes(m),
                SpeedKmh = 55.0
            });
        }

        // 2. Dừng nghỉ 30 phút (từ phút 180 đến phút 210, speed = 0)
        for (int m = 185; m <= 210; m += 5)
        {
            _context.TelemetryRecords.Add(new TelemetryRecord
            {
                TenantId = _tenantId,
                VehicleId = vehicle.Id,
                RecordedAtUtc = startTime.AddMinutes(m),
                SpeedKmh = 0.0
            });
        }

        // 3. Lái xe tiếp 40 phút sau khi nghỉ
        for (int m = 220; m <= 250; m += 10)
        {
            _context.TelemetryRecords.Add(new TelemetryRecord
            {
                TenantId = _tenantId,
                VehicleId = vehicle.Id,
                RecordedAtUtc = startTime.AddMinutes(m),
                SpeedKmh = 60.0
            });
        }
        await _context.SaveChangesAsync();

        var result = await _hosService.CalculateDriverHosStatusAsync(driver.Id, startTime.AddMinutes(250));

        // Chuỗi liên tục sau khi nghỉ 30 phút chỉ còn là chặng mới (~40 phút), không vượt 240
        result.ContinuousDrivingMinutes.Should().BeLessThan(100);
        result.AlertLevel.Should().Be(HosAlertLevel.Normal);
        // Nhưng tổng thời gian trong ngày vẫn tích lũy
        result.DailyDrivingMinutes.Should().BeGreaterThan(200);
    }
}
