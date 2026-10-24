using System;
using System.Collections.Generic;
using FluentAssertions;
using VDBus.Application.Services;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using Xunit;

namespace VDBus.Application.Tests;

public class DispatchRecommendationServiceTests
{
    [Fact]
    public void OverweightVehicle_ShouldGetZeroTotalScoreAndOverweightReason()
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            TotalWeightKg = 15000, // 15 tấn
            RequiredVehicleType = VehicleType.MediumTruck
        };

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            LicensePlate = "29C-111.11",
            MaxPayloadKg = 8000, // Chỉ tải được 8 tấn -> Quá tải!
            Type = VehicleType.MediumTruck
        };

        var driver = new Driver { FullName = "Nguyễn Văn A" };

        var match = DispatchRecommendationService.CalculateVehicleMatch(order, vehicle, driver);

        match.IsOverweight.Should().BeTrue();
        match.TotalScore.Should().Be(0);
        match.CapacityScore.Should().Be(0);
        match.BreakdownReasons.Should().Contain(r => r.Contains("Quá tải trọng quy định"));
    }

    [Fact]
    public void OptimalCapacityAndExactVehicleType_ShouldScoreHigh()
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            TotalWeightKg = 7000,
            RequiredVehicleType = VehicleType.MediumTruck,
            PickupLat = 21.0285,
            PickupLng = 105.8542 // Hà Nội
        };

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            LicensePlate = "29C-222.22",
            MaxPayloadKg = 8000, // 7/8 tấn = 87.5% lấp đầy (rất tối ưu)
            Type = VehicleType.MediumTruck,
            CurrentLocationLat = 21.0300,
            CurrentLocationLng = 105.8500 // Cách điểm lấy chưa đến 1 km
        };

        var driver = new Driver { FullName = "Trần Văn B" };

        var match = DispatchRecommendationService.CalculateVehicleMatch(order, vehicle, driver);

        match.IsOverweight.Should().BeFalse();
        match.CapacityScore.Should().BeGreaterThan(90);
        match.TypeScore.Should().Be(100);
        match.TotalScore.Should().BeGreaterThan(80);
        match.BreakdownReasons.Should().Contain(r => r.Contains("Khớp chính xác loại phương tiện yêu cầu"));
    }

    [Fact]
    public void BackhaulOpportunity_ShouldAwardMaximumBackhaulScore()
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            TotalWeightKg = 5000,
            RequiredVehicleType = VehicleType.LightTruck,
            PickupLat = 20.9572,
            PickupLng = 105.8458 // Kho Pháp Vân
        };

        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            LicensePlate = "29C-333.33",
            MaxPayloadKg = 6000,
            Type = VehicleType.LightTruck
        };

        // Chuyến trước kết thúc trả hàng cách kho lấy 5 km
        var recentTrip = new Trip
        {
            VehicleId = vehicle.Id,
            Stops = new List<Stop>
            {
                new Stop
                {
                    StopOrder = 1,
                    Latitude = 20.9600,
                    Longitude = 105.8400 // ~ 500m từ kho Pháp Vân
                }
            }
        };

        var match = DispatchRecommendationService.CalculateVehicleMatch(
            order, vehicle, null, new List<Trip> { recentTrip });

        match.IsBackhaulCandidate.Should().BeTrue();
        match.BackhaulScore.Should().Be(100);
        match.BreakdownReasons.Should().Contain(r => r.Contains("Cơ hội ghép chuyến chiều về"));
    }
}
