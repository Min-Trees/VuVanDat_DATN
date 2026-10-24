using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class GeofenceServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly GeofenceService _geofenceService;
    private readonly Guid _tenantId = Guid.NewGuid();

    public GeofenceServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _geofenceService = new GeofenceService(_context);
    }

    [Fact]
    public async Task ProcessLocation_WhenVehicleEntersGeofence_ShouldCreateTrackingRecord()
    {
        var vehicle = new Vehicle { Id = Guid.NewGuid(), TenantId = _tenantId, LicensePlate = "43C-888.88" };
        var geofence = new Geofence
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            Name = "Kho Vinamilk Hoa Khanh",
            CenterLatitude = 16.074,
            CenterLongitude = 108.153,
            RadiusMeters = 300,
            FreeTimeMinutes = 60,
            DetentionRatePerHourVnd = 150000m
        };

        _context.Vehicles.Add(vehicle);
        _context.Geofences.Add(geofence);
        await _context.SaveChangesAsync();

        var entryTime = DateTime.UtcNow;
        // Điểm này cách tâm chỉ ~30m -> nằm trong bán kính 300m
        var result = await _geofenceService.ProcessVehicleLocationAsync(
            vehicle.Id,
            16.0742,
            108.1531,
            entryTime);

        result.Should().NotBeNull();
        result!.Status.Should().Be("Tracking");
        result.GeofenceId.Should().Be(geofence.Id);
        result.FreeTimeMinutes.Should().Be(60);
        result.DepartedAtUtc.Should().BeNull();
    }

    [Fact]
    public async Task ProcessLocation_WhenVehicleDepartsWithinFreeTime_ShouldHaveZeroFee()
    {
        var vehicle = new Vehicle { Id = Guid.NewGuid(), TenantId = _tenantId, LicensePlate = "43C-999.99" };
        var geofence = new Geofence
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            Name = "Kho Hoa Phat Dung Quat",
            CenterLatitude = 15.342,
            CenterLongitude = 108.784,
            RadiusMeters = 400,
            FreeTimeMinutes = 60,
            DetentionRatePerHourVnd = 200000m
        };

        _context.Vehicles.Add(vehicle);
        _context.Geofences.Add(geofence);
        await _context.SaveChangesAsync();

        var entryTime = DateTime.UtcNow.AddMinutes(-45);
        // Bước 1: Vào kho lúc entryTime
        await _geofenceService.ProcessVehicleLocationAsync(vehicle.Id, 15.3421, 108.7841, entryTime);

        // Bước 2: Rời kho sau 45 phút (tọa độ xa > 5km)
        var exitTime = DateTime.UtcNow;
        var result = await _geofenceService.ProcessVehicleLocationAsync(vehicle.Id, 15.3900, 108.8200, exitTime);

        result.Should().NotBeNull();
        result!.DepartedAtUtc.Should().Be(exitTime);
        result.DetentionMinutes.Should().Be(0);
        result.DetentionFeeVnd.Should().Be(0);
        result.Status.Should().Be("Completed");
    }

    [Fact]
    public async Task ProcessLocation_WhenVehicleDepartsExceedingFreeTime_ShouldCalculateDetentionFeeCorrectly()
    {
        var vehicle = new Vehicle { Id = Guid.NewGuid(), TenantId = _tenantId, LicensePlate = "43H-123.45" };
        var geofence = new Geofence
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            Name = "Cang Tien Sa Da Nang",
            CenterLatitude = 16.128,
            CenterLongitude = 108.219,
            RadiusMeters = 500,
            FreeTimeMinutes = 60,
            DetentionRatePerHourVnd = 150000m
        };

        _context.Vehicles.Add(vehicle);
        _context.Geofences.Add(geofence);
        await _context.SaveChangesAsync();

        // Xe vào cảng lúc trước đó 150 phút (2.5 giờ)
        var entryTime = DateTime.UtcNow.AddMinutes(-150);
        await _geofenceService.ProcessVehicleLocationAsync(vehicle.Id, 16.1281, 108.2191, entryTime);

        // Xe rời cảng bây giờ (tổng đỗ 150 phút, trừ miễn phí 60 phút = 90 phút phạt)
        var exitTime = DateTime.UtcNow;
        var result = await _geofenceService.ProcessVehicleLocationAsync(vehicle.Id, 16.0500, 108.1500, exitTime);

        result.Should().NotBeNull();
        result!.DetentionMinutes.Should().Be(90);
        // 90 phút / 60 = 1.5h * 150,000 VND = 225,000 VND
        result.DetentionFeeVnd.Should().Be(225000m);
        result.Status.Should().Be("Billed");
    }
}
