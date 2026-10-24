using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Routing;

namespace VDBus.Application.Services;

public class RoutingService : IRoutingService
{
    private readonly IApplicationDbContext _context;

    public RoutingService(IApplicationDbContext context)
    {
        _context = context;
    }

    public decimal CalculateRoadDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371.0; // Bán kính Trái Đất (km)
        var dLat = (lat2 - lat1) * Math.PI / 180.0;
        var dLon = (lon2 - lon1) * Math.PI / 180.0;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        var straightLineKm = R * c;

        // Hệ số uốn lượn đường bộ Việt Nam (Road Curvature Factor) ~1.28
        return Math.Round((decimal)(straightLineKm * 1.28), 2);
    }

    public async Task<RoutePlanResultDto> OptimizeMultiStopRouteAsync(OptimizeRouteRequestDto request, CancellationToken ct = default)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == request.VehicleId, ct);
        if (vehicle == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy phương tiện có ID: {request.VehicleId}");
        }

        var rules = await _context.RegulationRules
            .Where(r => r.IsActive)
            .ToListAsync(ct);

        // Thuật toán sắp xếp đa điểm VRPTW:
        // 1. Điểm lấy hàng (Pickup) luôn ưu tiên trước điểm giao hàng (Delivery)
        // 2. Sắp xếp theo thứ tự cửa sổ thời gian (Earliest Deadline First)
        var sortedStops = request.Stops
            .OrderBy(s => s.StopType == "Pickup" ? 0 : 1)
            .ThenBy(s => s.WindowEndUtc)
            .ThenBy(s => s.WindowStartUtc)
            .ToList();

        var optimizedStops = new List<OptimizedStopDto>();
        var warnings = new List<string>();
        int violationsCount = 0;

        double currentLat = request.OriginLatitude;
        double currentLon = request.OriginLongitude;
        DateTime currentTime = request.DepartureTimeUtc == default ? DateTime.UtcNow : request.DepartureTimeUtc;
        decimal totalDistance = 0m;
        int totalDurationMinutes = 0;

        for (int i = 0; i < sortedStops.Count; i++)
        {
            var stop = sortedStops[i];
            var legDistance = CalculateRoadDistanceKm(currentLat, currentLon, stop.Latitude, stop.Longitude);
            totalDistance += legDistance;

            // Ước tính vận tốc xe tải trung bình 50 km/h
            int travelMinutes = (int)Math.Max(5, Math.Round((double)legDistance / 50.0 * 60.0));
            currentTime = currentTime.AddMinutes(travelMinutes);

            var arrivalTime = currentTime;
            // Dừng bốc/xếp hàng 20 phút mỗi điểm
            currentTime = currentTime.AddMinutes(20);
            totalDurationMinutes += travelMinutes + 20;

            // Kiểm tra quy định cấm giờ nội đô
            bool isViable = true;
            string? warningText = null;

            foreach (var rule in rules)
            {
                // Kiểm tra tên tuyến đường hoặc địa phương khớp với địa chỉ dừng
                if (stop.Address.ToLower().Contains(rule.RouteName.ToLower()) ||
                    stop.Address.ToLower().Contains(rule.ProvinceCode.ToLower()))
                {
                    // Kiểm tra tải trọng xe
                    decimal vehicleTons = vehicle.MaxPayloadKg / 1000m;
                    if (vehicleTons > rule.MaxWeightTons)
                    {
                        var timeOnly = arrivalTime.TimeOfDay;
                        if (timeOnly >= rule.StartTime && timeOnly <= rule.EndTime)
                        {
                            isViable = false;
                            violationsCount++;
                            warningText = $"CẢNH BÁO CẤM TẢI: Xe {vehicle.LicensePlate} ({vehicleTons:F1} tấn) vượt quá {rule.MaxWeightTons:F1} tấn trên tuyến {rule.RouteName} trong khung giờ {rule.StartTime:hh\\:mm} - {rule.EndTime:hh\\:mm}. (Cần chuyên gia pháp lý xác nhận)";
                            warnings.Add(warningText);
                            break;
                        }
                    }
                }
            }

            optimizedStops.Add(new OptimizedStopDto
            {
                SequenceOrder = i + 1,
                StopId = stop.StopId,
                StopType = stop.StopType,
                Address = stop.Address,
                Latitude = stop.Latitude,
                Longitude = stop.Longitude,
                WindowStartUtc = stop.WindowStartUtc,
                WindowEndUtc = stop.WindowEndUtc,
                EstimatedArrivalUtc = arrivalTime,
                DistanceKmFromPrevious = legDistance,
                DurationMinutesFromPrevious = travelMinutes,
                IsViableWithRegulations = isViable,
                RegulationWarning = warningText
            });

            currentLat = stop.Latitude;
            currentLon = stop.Longitude;
        }

        // Tính toán mức tiêu hao nhiên liệu ước tính
        var fuelConsumptionRate = vehicle.FuelConsumptionLitrePer100Km > 0 ? vehicle.FuelConsumptionLitrePer100Km : 18.5m;
        var estimatedFuel = Math.Round(totalDistance * (fuelConsumptionRate / 100m), 2);

        return new RoutePlanResultDto
        {
            VehicleId = vehicle.Id,
            LicensePlate = vehicle.LicensePlate,
            TotalDistanceKm = totalDistance,
            TotalDurationMinutes = totalDurationMinutes,
            EstimatedFuelLitre = estimatedFuel,
            Stops = optimizedStops,
            ViolationsCount = violationsCount,
            RegulationWarnings = warnings
        };
    }
}
