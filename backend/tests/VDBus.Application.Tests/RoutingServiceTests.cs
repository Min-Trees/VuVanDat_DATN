using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Routing;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class RoutingServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly RoutingService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public RoutingServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _service = new RoutingService(_context);
    }

    [Fact]
    public void CalculateRoadDistanceKm_ShouldApplyCurvatureFactorGreaterThanStraightLine()
    {
        // Da Nang to Tam Ky (~65 km straight line)
        var roadDistance = _service.CalculateRoadDistanceKm(16.074, 108.153, 15.567, 108.478);

        // Road distance should be approximately 70 - 90 km
        roadDistance.Should().BeInRange(70m, 95m);
    }

    [Fact]
    public async Task OptimizeMultiStopRoute_ShouldPrioritizePickupsBeforeDeliveries()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "43C-189.24",
            MaxPayloadKg = 8500,
            FuelConsumptionLitrePer100Km = 18.5m
        };
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        var baseTime = DateTime.UtcNow.Date.AddHours(8); // 08:00
        var request = new OptimizeRouteRequestDto
        {
            VehicleId = vehicle.Id,
            OriginLatitude = 16.068,
            OriginLongitude = 108.212,
            DepartureTimeUtc = baseTime,
            Stops = new List<StopRequestDto>
            {
                new() { StopId = "S1", StopType = "Delivery", Address = "Diem Giao Big C", Latitude = 16.068, Longitude = 108.212, WindowStartUtc = baseTime.AddHours(4), WindowEndUtc = baseTime.AddHours(6) },
                new() { StopId = "S2", StopType = "Pickup", Address = "Diem Lay Hoa Khanh", Latitude = 16.074, Longitude = 108.153, WindowStartUtc = baseTime.AddHours(1), WindowEndUtc = baseTime.AddHours(3) }
            }
        };

        var result = await _service.OptimizeMultiStopRouteAsync(request);

        result.Should().NotBeNull();
        result.Stops.Should().HaveCount(2);
        // S2 (Pickup) must be sequence 1, S1 (Delivery) must be sequence 2
        result.Stops[0].StopId.Should().Be("S2");
        result.Stops[0].StopType.Should().Be("Pickup");
        result.Stops[1].StopId.Should().Be("S1");
        result.Stops[1].StopType.Should().Be("Delivery");

        result.TotalDistanceKm.Should().BeGreaterThan(0);
        result.EstimatedFuelLitre.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task OptimizeMultiStopRoute_WhenViolatingUrbanRegulation_ShouldGenerateWarning()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "43H-012.88",
            MaxPayloadKg = 30000, // 30 tấn xe tải nặng
            FuelConsumptionLitrePer100Km = 32.0m
        };
        _context.Vehicles.Add(vehicle);

        // Quy định cấm xe trên 2.5 tấn vào đường Vành đai từ 06:00 đến 09:00
        _context.RegulationRules.Add(new RegulationRule
        {
            TenantId = _tenantId,
            ProvinceCode = "HN",
            RouteName = "Vanh Dai 3",
            MaxWeightTons = 2.5m,
            StartTime = new TimeSpan(6, 0, 0),
            EndTime = new TimeSpan(9, 0, 0),
            IsActive = true
        });
        await _context.SaveChangesAsync();

        var baseTime = DateTime.UtcNow.Date.AddHours(6).AddMinutes(30); // 06:30 sáng (khung giờ cấm)
        var request = new OptimizeRouteRequestDto
        {
            VehicleId = vehicle.Id,
            OriginLatitude = 21.000,
            OriginLongitude = 105.800,
            DepartureTimeUtc = baseTime,
            Stops = new List<StopRequestDto>
            {
                new() { StopId = "S1", StopType = "Delivery", Address = "Doan duong Vanh Dai 3 HN", Latitude = 21.010, Longitude = 105.810, WindowStartUtc = baseTime, WindowEndUtc = baseTime.AddHours(2) }
            }
        };

        var result = await _service.OptimizeMultiStopRouteAsync(request);

        result.ViolationsCount.Should().BeGreaterThan(0);
        result.RegulationWarnings.Should().NotBeEmpty();
        result.RegulationWarnings[0].Should().Contain("CẢNH BÁO CẤM TẢI");
        result.RegulationWarnings[0].Should().Contain("chuyên gia pháp lý xác nhận");
    }
}
