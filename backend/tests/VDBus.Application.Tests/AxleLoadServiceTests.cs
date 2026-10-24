using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.AxleLoad;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class AxleLoadServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly AxleLoadService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public AxleLoadServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _service = new AxleLoadService(_context);
    }

    [Fact]
    public async Task CalculateAxleLoad_WhenCargoPlacedAtRear_ShouldDetectRearOverload()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "43C-189.24",
            AxleCount = 2,
            LengthMm = 7400
        };
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        // Đặt 9,000 kg hàng dồn hết về đuôi xe (vị trí 6,000 mm từ đầu thùng)
        var request = new AxleLoadCalculationRequestDto
        {
            VehicleId = vehicle.Id,
            Pallets = new List<PalletItemDto>
            {
                new() { PalletCode = "P1", WeightKg = 4500, PositionMmFromFront = 5500, LengthMm = 1200 },
                new() { PalletCode = "P2", WeightKg = 4500, PositionMmFromFront = 6200, LengthMm = 1200 }
            }
        };

        var result = await _service.CalculateAxleLoadAsync(request);

        result.Should().NotBeNull();
        result.IsRearOverloaded.Should().BeTrue();
        result.Status.Should().Be("RearOverloaded");
        result.Recommendation.Should().Contain("CẢNH BÁO QUÁ TẢI TRỤC SAU");
        result.MarginOfErrorPercentage.Should().Be(3.0m);
    }

    [Fact]
    public async Task CalculateAxleLoad_WhenCargoEvenlyDistributed_ShouldBeSafe()
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            LicensePlate = "43C-225.19",
            AxleCount = 2,
            LengthMm = 7400
        };
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        // 6,000 kg đặt cân đối tại trung tâm thùng xe (3,000 mm)
        var request = new AxleLoadCalculationRequestDto
        {
            VehicleId = vehicle.Id,
            TotalCargoWeightKg = 6000,
            CustomCenterOfGravityMm = 3000
        };

        var result = await _service.CalculateAxleLoadAsync(request);

        result.Should().NotBeNull();
        result.IsFrontOverloaded.Should().BeFalse();
        result.IsRearOverloaded.Should().BeFalse();
        result.Status.Should().Be("Safe");
        result.Recommendation.Should().Contain("cân bằng");
    }
}
