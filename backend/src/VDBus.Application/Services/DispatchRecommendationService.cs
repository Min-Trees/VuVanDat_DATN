using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Dispatch;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;

namespace VDBus.Application.Services;

public class DispatchRecommendationService : IDispatchRecommendationService
{
    private readonly IApplicationDbContext _context;

    // Trọng số các yếu tố cấu thành điểm
    private const double WeightCapacity = 0.35;
    private const double WeightType = 0.25;
    private const double WeightDistance = 0.20;
    private const double WeightBackhaul = 0.20;

    public DispatchRecommendationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DispatchRecommendationResultDto> GetRecommendationsForOrderAsync(Guid orderId, CancellationToken ct = default)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy đơn hàng với mã ID: {orderId}");
        }

        // Lấy danh sách xe đang khả dụng của tenant
        var availableVehicles = await _context.Vehicles
            .Where(v => v.Status == "Available" || v.Status == "OnTrip")
            .ToListAsync(ct);

        // Lấy danh sách tài xế khả dụng kèm xe được gán
        var drivers = await _context.Drivers
            .Where(d => d.Status != "Inactive")
            .ToListAsync(ct);

        // Lấy chuyến xe gần nhất của các xe để đánh giá ghép chuyến chiều về (backhaul)
        var recentCompletedTrips = await _context.Trips
            .Include(t => t.Stops)
            .Where(t => t.Status == TripStatus.Completed || t.Status == TripStatus.InProgress)
            .OrderByDescending(t => t.EndTimeUtc ?? t.CreatedAtUtc)
            .Take(50)
            .ToListAsync(ct);

        var recommendations = new List<VehicleRecommendationItemDto>();

        foreach (var vehicle in availableVehicles)
        {
            var driver = drivers.FirstOrDefault(d => d.AssignedVehicleId == vehicle.Id) ??
                         drivers.FirstOrDefault(d => d.Status == "Available");

            var rec = CalculateVehicleMatch(order, vehicle, driver, recentCompletedTrips);
            recommendations.Add(rec);
        }

        // Sắp xếp theo điểm tổng hợp giảm dần
        recommendations = recommendations.OrderByDescending(r => r.TotalScore).ToList();

        return new DispatchRecommendationResultDto
        {
            OrderId = order.Id,
            OrderCode = order.OrderCode,
            OrderWeightKg = order.TotalWeightKg,
            RequiredVehicleType = order.RequiredVehicleType.ToString(),
            RecommendedVehicles = recommendations
        };
    }

    public static VehicleRecommendationItemDto CalculateVehicleMatch(
        Order order,
        Vehicle vehicle,
        Driver? driver,
        List<Trip>? recentTrips = null)
    {
        var reasons = new List<string>();

        // 1. Điểm tải trọng (Capacity Score - 35%)
        double capacityScore = 0;
        bool isOverweight = order.TotalWeightKg > vehicle.MaxPayloadKg;
        double utilizationPercent = vehicle.MaxPayloadKg > 0
            ? Math.Round((double)(order.TotalWeightKg / vehicle.MaxPayloadKg) * 100, 1)
            : 0;

        if (isOverweight)
        {
            capacityScore = 0;
            reasons.Add($"Quá tải trọng quy định: Hàng {order.TotalWeightKg:N0} kg > Xe tối đa {vehicle.MaxPayloadKg:N0} kg");
        }
        else
        {
            // Tỷ lệ lý tưởng là 70% - 95%
            double delta = Math.Abs(85.0 - utilizationPercent);
            capacityScore = Math.Max(0, Math.Round(100.0 - delta * 1.5, 1));
            reasons.Add($"Đạt tỷ lệ lấp đầy tải trọng {utilizationPercent}% ({order.TotalWeightKg:N0} / {vehicle.MaxPayloadKg:N0} kg)");
        }

        // 2. Điểm loại phương tiện (Vehicle Type Score - 25%)
        double typeScore;
        if (vehicle.Type == order.RequiredVehicleType)
        {
            typeScore = 100;
            reasons.Add($"Khớp chính xác loại phương tiện yêu cầu ({vehicle.Type})");
        }
        else if (vehicle.Type == VehicleType.HeavyTruck && order.RequiredVehicleType == VehicleType.MediumTruck)
        {
            typeScore = 70; // Xe lớn chở đơn nhỏ được nhưng hiệu quả chi phí thấp hơn
            reasons.Add($"Phương tiện thay thế tương thích ({vehicle.Type} thay cho {order.RequiredVehicleType})");
        }
        else
        {
            typeScore = 20;
            reasons.Add($"Khác chủng loại phương tiện yêu cầu (Xe: {vehicle.Type}, Yêu cầu: {order.RequiredVehicleType})");
        }

        // 3. Điểm khoảng cách tiếp cận (Distance Score - 20%)
        double distanceKm = 0;
        double distanceScore = 50; // Giá trị cơ sở nếu chưa có tọa độ GPS xe
        if (vehicle.CurrentLocationLat.HasValue && vehicle.CurrentLocationLng.HasValue &&
            order.PickupLat != 0 && order.PickupLng != 0)
        {
            distanceKm = Math.Round(CalculateHaversineKm(
                vehicle.CurrentLocationLat.Value, vehicle.CurrentLocationLng.Value,
                order.PickupLat, order.PickupLng), 1);

            distanceScore = Math.Max(0, Math.Round(100.0 - (distanceKm / 100.0) * 100.0, 1));
            reasons.Add($"Khoảng cách từ xe đến kho lấy: {distanceKm} km");
        }
        else
        {
            reasons.Add("Chưa có tọa độ GPS thời gian thực của xe (tính điểm khoảng cách cơ bản)");
        }

        // 4. Điểm ghép chuyến chiều về (Backhaul Score - 20%)
        double backhaulScore = 0;
        bool isBackhaul = false;
        var lastTrip = recentTrips?.FirstOrDefault(t => t.VehicleId == vehicle.Id);
        if (lastTrip != null && lastTrip.Stops.Any())
        {
            var lastDeliveryStop = lastTrip.Stops.OrderBy(s => s.StopOrder).LastOrDefault();
            if (lastDeliveryStop != null && order.PickupLat != 0 && order.PickupLng != 0)
            {
                double distFromLastStop = CalculateHaversineKm(
                    lastDeliveryStop.Latitude, lastDeliveryStop.Longitude,
                    order.PickupLat, order.PickupLng);

                if (distFromLastStop <= 30.0)
                {
                    isBackhaul = true;
                    backhaulScore = 100;
                    reasons.Add($"Cơ hội ghép chuyến chiều về: Điểm trả hàng chuyến trước cách điểm lấy chỉ {distFromLastStop:F1} km");
                }
            }
        }

        if (!isBackhaul)
        {
            backhaulScore = 40; // Điểm trung tính khi không có dữ liệu chuyến về
        }

        // Tính điểm tổng hợp (Nếu quá tải trọng -> điểm tổng = 0)
        double totalScore = isOverweight
            ? 0
            : Math.Round((capacityScore * WeightCapacity) +
                         (typeScore * WeightType) +
                         (distanceScore * WeightDistance) +
                         (backhaulScore * WeightBackhaul), 1);

        return new VehicleRecommendationItemDto
        {
            VehicleId = vehicle.Id,
            LicensePlate = vehicle.LicensePlate,
            VehicleType = vehicle.Type.ToString(),
            DriverId = driver?.Id,
            DriverName = driver?.FullName ?? "Chưa gán tài xế",
            TotalScore = totalScore,
            CapacityScore = capacityScore,
            TypeScore = typeScore,
            DistanceScore = distanceScore,
            BackhaulScore = backhaulScore,
            DistanceKm = distanceKm,
            CapacityUtilizationPercent = utilizationPercent,
            IsBackhaulCandidate = isBackhaul,
            IsOverweight = isOverweight,
            BreakdownReasons = reasons
        };
    }

    private static double CalculateHaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double r = 6371; // Bán kính Trái Đất (km)
        double dLat = ToRadians(lat2 - lat1);
        double dLon = ToRadians(lon2 - lon1);

        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                   Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                   Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return r * c;
    }

    private static double ToRadians(double degrees) => degrees * (Math.PI / 180.0);
}
