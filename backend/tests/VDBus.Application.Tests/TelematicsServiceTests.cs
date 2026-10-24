using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Telematics;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class TelematicsServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ITelematicsNotificationService> _mockNotifier;
    private readonly Mock<ICurrentTenantService> _mockTenant;
    private readonly TelematicsService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public TelematicsServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _mockTenant = new Mock<ICurrentTenantService>();
        _mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, _mockTenant.Object);
        _mockNotifier = new Mock<ITelematicsNotificationService>();
        _service = new TelematicsService(_context, _mockNotifier.Object);
    }

    [Fact]
    public async Task IngestTelemetryAsync_ShouldSaveRecordAndBroadcast()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "43C-189.24",
            MakeModel = "Hino 500"
        };
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        var telemetry = new TelemetryDto
        {
            TenantId = _tenantId,
            VehicleId = vehicle.Id,
            Latitude = 16.074,
            Longitude = 108.153,
            SpeedKmh = 58.0,
            HeadingDegrees = 140.0,
            TemperatureCelsius = -18.5,
            TirePressures = new List<TirePressureItemDto>
            {
                new() { Position = "FrontLeft", PressurePsi = 115, TemperatureCelsius = 42, Status = "Normal" },
                new() { Position = "FrontRight", PressurePsi = 114, TemperatureCelsius = 43, Status = "Normal" }
            },
            RecordedAtUtc = DateTime.UtcNow,
            IsSimulated = true
        };

        var result = await _service.IngestTelemetryAsync(telemetry);

        result.Should().NotBeNull();
        result.LicensePlate.Should().Be("43C-189.24");

        // Verify persisted record
        var record = await _context.TelemetryRecords.FirstOrDefaultAsync(r => r.VehicleId == vehicle.Id);
        record.Should().NotBeNull();
        record!.SpeedKmh.Should().Be(58.0);
        record.TemperatureCelsius.Should().Be(-18.5);

        // Verify vehicle location updated
        var updatedVehicle = await _context.Vehicles.FindAsync(vehicle.Id);
        updatedVehicle!.CurrentLocationLat.Should().Be(16.074);
        updatedVehicle.CurrentLocationLng.Should().Be(108.153);

        // Verify broadcast triggered
        _mockNotifier.Verify(n => n.BroadcastTelemetryAsync(It.IsAny<TelemetryDto>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetVehicleTelemetryHistoryAsync_ShouldFilterByTimeWindow()
    {
        var vehicleId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        _context.TelemetryRecords.AddRange(
            new TelemetryRecord { TenantId = _tenantId, VehicleId = vehicleId, RecordedAtUtc = now.AddHours(-3), SpeedKmh = 40 },
            new TelemetryRecord { TenantId = _tenantId, VehicleId = vehicleId, RecordedAtUtc = now.AddHours(-1), SpeedKmh = 60 },
            new TelemetryRecord { TenantId = _tenantId, VehicleId = vehicleId, RecordedAtUtc = now.AddHours(+1), SpeedKmh = 80 }
        );
        await _context.SaveChangesAsync();

        var history = await _service.GetVehicleTelemetryHistoryAsync(vehicleId, now.AddHours(-2), now);

        history.Should().HaveCount(1);
        history[0].SpeedKmh.Should().Be(60);
    }
}
