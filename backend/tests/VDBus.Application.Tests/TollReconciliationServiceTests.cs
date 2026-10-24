using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Vetc;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Infrastructure.Persistence;
using Xunit;

namespace VDBus.Application.Tests;

public class TollReconciliationServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IVetcProvider> _mockVetc;
    private readonly TollReconciliationService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public TollReconciliationServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockTenant = new Mock<ICurrentTenantService>();
        mockTenant.Setup(t => t.TenantId).Returns(_tenantId);

        _context = new ApplicationDbContext(options, mockTenant.Object);
        _mockVetc = new Mock<IVetcProvider>();
        _mockVetc.Setup(v => v.IsMock).Returns(true);

        _service = new TollReconciliationService(_context, _mockVetc.Object);
    }

    [Fact]
    public async Task SyncAndReconcileTripTolls_ShouldFetchFromProviderAndSaveTransactions()
    {
        var vehicle = new Vehicle { Id = Guid.NewGuid(), TenantId = _tenantId, LicensePlate = "43C-189.24" };
        var trip = new Trip
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantId,
            TripCode = "CH-2026-TEST",
            VehicleId = vehicle.Id,
            StartTimeUtc = DateTime.UtcNow.AddHours(-4),
            EndTimeUtc = DateTime.UtcNow
        };

        _context.Vehicles.Add(vehicle);
        _context.Trips.Add(trip);
        await _context.SaveChangesAsync();

        var mockTolls = new List<VetcTransactionDto>
        {
            new() { TransactionId = "TX-BOT-01", StationName = "BOT Dien Ban", TollAmountVnd = 35000, TimestampUtc = DateTime.UtcNow.AddHours(-3), IsSimulated = true },
            new() { TransactionId = "TX-BOT-02", StationName = "BOT Tam Ky", TollAmountVnd = 45000, TimestampUtc = DateTime.UtcNow.AddHours(-1), IsSimulated = true }
        };

        _mockVetc.Setup(v => v.GetTransactionsByPlateAsync("43C-189.24", It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockTolls);

        var result = await _service.SyncAndReconcileTripTollsAsync(trip.Id);

        result.Should().NotBeNull();
        result.TotalTollAmountVnd.Should().Be(80000);
        result.StationCount.Should().Be(2);
        result.IsSimulated.Should().BeTrue();

        // Check records in db
        var savedTolls = await _context.TollTransactions.ToListAsync();
        savedTolls.Should().HaveCount(2);
        savedTolls.Should().OnlyContain(t => t.TripId == trip.Id && t.IsReconciled);
    }
}
