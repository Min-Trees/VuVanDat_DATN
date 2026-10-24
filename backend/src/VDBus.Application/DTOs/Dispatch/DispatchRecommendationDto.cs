using System;
using System.Collections.Generic;

namespace VDBus.Application.DTOs.Dispatch;

public class VehicleRecommendationItemDto
{
    public Guid VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public Guid? DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;

    public double TotalScore { get; set; } // Điểm tổng hợp (0 - 100)
    public double CapacityScore { get; set; } // Điểm tải trọng (35%)
    public double TypeScore { get; set; } // Điểm loại xe (25%)
    public double DistanceScore { get; set; } // Điểm khoảng cách (20%)
    public double BackhaulScore { get; set; } // Điểm ghép chuyến chiều về (20%)

    public double DistanceKm { get; set; }
    public double CapacityUtilizationPercent { get; set; }
    public bool IsBackhaulCandidate { get; set; }
    public bool IsOverweight { get; set; }

    public List<string> BreakdownReasons { get; set; } = new();
}

public class DispatchRecommendationResultDto
{
    public Guid OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public decimal OrderWeightKg { get; set; }
    public string RequiredVehicleType { get; set; } = string.Empty;
    public List<VehicleRecommendationItemDto> RecommendedVehicles { get; set; } = new();
}
