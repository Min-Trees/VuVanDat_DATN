using System;
using FluentAssertions;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using Xunit;

namespace VDBus.Domain.Tests;

public class Phase2DomainEntitiesTests
{
    [Fact]
    public void Device_WhenCreated_ShouldHaveValidDefaults()
    {
        var tenantId = Guid.NewGuid();
        var device = new Device
        {
            TenantId = tenantId,
            SerialNumber = "IMEI-860921048829104",
            Name = "Cam bien thung lanh Xe 43C-189.24",
            DeviceType = DeviceType.ColdChainSensor,
            BatteryPercentage = 95,
            IsSimulated = true
        };

        device.TenantId.Should().Be(tenantId);
        device.DeviceType.Should().Be(DeviceType.ColdChainSensor);
        device.IsActive.Should().BeTrue();
        device.IsSimulated.Should().BeTrue();
        device.FirmwareVersion.Should().Be("1.0.0");
    }

    [Fact]
    public void TelemetryRecord_ShouldStoreColdChainAndTpmsData()
    {
        var record = new TelemetryRecord
        {
            TenantId = Guid.NewGuid(),
            VehicleId = Guid.NewGuid(),
            RecordedAtUtc = DateTime.UtcNow,
            Latitude = 16.074,
            Longitude = 108.153,
            SpeedKmh = 62.5,
            HeadingDegrees = 145.0,
            TemperatureCelsius = -18.2, // Container lạnh
            HumidityPercentage = 85.0,
            FuelLevelPercentage = 78.5,
            TirePressuresJson = "[{\"pos\":\"FL\",\"psi\":116},{\"pos\":\"FR\",\"psi\":115}]",
            IsDoorOpen = false,
            IsSimulated = true
        };

        record.TemperatureCelsius.Should().Be(-18.2);
        record.SpeedKmh.Should().Be(62.5);
        record.IsDoorOpen.Should().BeFalse();
        record.IsSimulated.Should().BeTrue();
    }

    [Fact]
    public void GeofenceAndDetentionRecord_ShouldInitializeCorrectly()
    {
        var geofence = new Geofence
        {
            TenantId = Guid.NewGuid(),
            Name = "Kho tong Big C Da Nang",
            GeofenceType = GeofenceType.CustomerWarehouse,
            CenterLatitude = 16.068,
            CenterLongitude = 108.212,
            RadiusMeters = 250.0,
            FreeTimeMinutes = 60,
            DetentionRatePerHourVnd = 150000m
        };

        var arrived = DateTime.UtcNow.AddHours(-3);
        var departed = DateTime.UtcNow;
        var detention = new DetentionRecord
        {
            TenantId = geofence.TenantId,
            GeofenceId = geofence.Id,
            VehicleId = Guid.NewGuid(),
            ArrivedAtUtc = arrived,
            DepartedAtUtc = departed,
            FreeTimeMinutes = geofence.FreeTimeMinutes,
            DetentionMinutes = 120, // 3h - 1h mien phi = 2h
            DetentionFeeVnd = 300000m, // 2h * 150,000 VND
            Status = "Tracking"
        };

        detention.FreeTimeMinutes.Should().Be(60);
        detention.DetentionMinutes.Should().Be(120);
        detention.DetentionFeeVnd.Should().Be(300000m);
    }

    [Fact]
    public void AxleLoadCalculation_ShouldDefaultToThreePercentMarginOfError()
    {
        var calc = new AxleLoadCalculation
        {
            TenantId = Guid.NewGuid(),
            VehicleId = Guid.NewGuid(),
            TotalCargoWeightKg = 15000m,
            CenterOfGravityMmFromFront = 3500,
            FrontAxleLoadKg = 5200m,
            RearAxleLoadKg = 9800m,
            FrontAxleLimitKg = 6000m,
            RearAxleLimitKg = 10000m,
            IsFrontOverloaded = false,
            IsRearOverloaded = false,
            CalculationSummary = "F_rear = (15000 * 3500) / 5500 + F_empty_rear"
        };

        calc.MarginOfErrorPercentage.Should().Be(3.0m);
        calc.IsRearOverloaded.Should().BeFalse();
    }
}
