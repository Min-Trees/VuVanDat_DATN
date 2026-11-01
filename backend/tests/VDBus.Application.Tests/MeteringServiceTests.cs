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

public class MeteringServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly MeteringService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public MeteringServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _service = new MeteringService(_context, mockTenant.Object);
    }

    [Fact]
    public async Task GetTenantUsageMetering_CalculatesVehicleAndOrderPercentageAccurately()
    {
        var tenant = new Tenant
        {
            Id = _tenantId,
            Name = "VDBus Đà Nẵng",
            Code = "VDBUS-DN"
        };
        _context.Tenants.Add(tenant);

        // Thêm 5 xe
        for (int i = 0; i < 5; i++)
        {
            _context.Vehicles.Add(new Vehicle
            {
                TenantId = _tenantId,
                LicensePlate = $"43C-{100 + i}.00",
                MakeModel = "Hino 500"
            });
        }

        // Thêm 10 đơn hàng
        for (int i = 0; i < 10; i++)
        {
            _context.Orders.Add(new Order
            {
                TenantId = _tenantId,
                OrderCode = $"DH-2026-{100 + i}",
                CreatedAtUtc = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        var metering = await _service.GetTenantUsageMeteringAsync(_tenantId);

        metering.ActiveVehicles.Should().Be(5);
        metering.OrdersThisMonth.Should().Be(10);
        metering.MaxVehicles.Should().Be(25);
        metering.VehicleUsagePercentage.Should().Be(20.0m);
        metering.IsQuotaExceeded.Should().BeFalse();
    }

    [Fact]
    public async Task CanCreateVehicle_WhenUnderQuota_ReturnsTrue()
    {
        var canCreate = await _service.CanCreateVehicleAsync(_tenantId);
        canCreate.Should().BeTrue();
    }
}
