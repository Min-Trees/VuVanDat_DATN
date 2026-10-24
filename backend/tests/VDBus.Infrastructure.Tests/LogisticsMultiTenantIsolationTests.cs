using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Infrastructure.Tests;

public class LogisticsMultiTenantIsolationTests
{
    private readonly DbContextOptions<ApplicationDbContext> _dbOptions;

    public LogisticsMultiTenantIsolationTests()
    {
        _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task LogisticsTenantIsolation_TenantBCannotSeeTenantACustomersVehiclesOrOrders()
    {
        var tenantAId = Guid.NewGuid();
        var tenantBId = Guid.NewGuid();

        // 1. Tenant A tạo dữ liệu vận tải
        var mockTenantA = new Mock<ICurrentTenantService>();
        mockTenantA.Setup(s => s.TenantId).Returns(tenantAId);
        mockTenantA.Setup(s => s.UserId).Returns("dispatcher-a");

        var customerAId = Guid.NewGuid();
        var vehicleAId = Guid.NewGuid();
        var orderAId = Guid.NewGuid();

        using (var contextA = new ApplicationDbContext(_dbOptions, mockTenantA.Object))
        {
            var customerA = new Customer
            {
                Id = customerAId,
                TenantId = tenantAId,
                Name = "Vinamilk Logistics",
                Code = "KH-VNM"
            };
            var vehicleA = new Vehicle
            {
                Id = vehicleAId,
                TenantId = tenantAId,
                LicensePlate = "29C-888.88",
                MaxPayloadKg = 15000,
                Type = VehicleType.HeavyTruck
            };
            var orderA = new Order
            {
                Id = orderAId,
                TenantId = tenantAId,
                OrderCode = "DH-2026-9999",
                CustomerId = customerAId,
                PickupAddress = "Kho VSIP Bắc Ninh",
                DeliveryAddress = "Kho Tân Bình, TP.HCM",
                TotalWeightKg = 12000,
                Status = OrderStatus.PendingDispatch
            };

            contextA.Customers.Add(customerA);
            contextA.Vehicles.Add(vehicleA);
            contextA.Orders.Add(orderA);
            await contextA.SaveChangesAsync();
        }

        // 2. Tenant B truy vấn dữ liệu vận tải
        var mockTenantB = new Mock<ICurrentTenantService>();
        mockTenantB.Setup(s => s.TenantId).Returns(tenantBId);
        mockTenantB.Setup(s => s.UserId).Returns("dispatcher-b");

        using (var contextB = new ApplicationDbContext(_dbOptions, mockTenantB.Object))
        {
            var customersForB = await contextB.Customers.ToListAsync();
            var vehiclesForB = await contextB.Vehicles.ToListAsync();
            var ordersForB = await contextB.Orders.ToListAsync();

            // Assert: Dữ liệu trả về hoàn toàn rỗng đối với Tenant B
            customersForB.Should().BeEmpty();
            vehiclesForB.Should().BeEmpty();
            ordersForB.Should().BeEmpty();

            // Thử query trực tiếp Order theo Id của Tenant A
            var orderById = await contextB.Orders.FirstOrDefaultAsync(o => o.Id == orderAId);
            orderById.Should().BeNull();
        }
    }
}
