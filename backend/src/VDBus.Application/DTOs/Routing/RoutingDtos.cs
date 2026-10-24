using System;
using System.Collections.Generic;

namespace VDBus.Application.DTOs.Routing;

public class StopRequestDto
{
    public string StopId { get; set; } = string.Empty;
    public string StopType { get; set; } = "Delivery"; // Pickup hoặc Delivery
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime WindowStartUtc { get; set; }
    public DateTime WindowEndUtc { get; set; }
    public decimal WeightKg { get; set; }
}

public class OptimizeRouteRequestDto
{
    public Guid VehicleId { get; set; }
    public DateTime DepartureTimeUtc { get; set; }
    public double OriginLatitude { get; set; }
    public double OriginLongitude { get; set; }
    public string OriginAddress { get; set; } = string.Empty;
    public List<StopRequestDto> Stops { get; set; } = new();
}

public class OptimizedStopDto
{
    public int SequenceOrder { get; set; }
    public string StopId { get; set; } = string.Empty;
    public string StopType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime WindowStartUtc { get; set; }
    public DateTime WindowEndUtc { get; set; }
    public DateTime EstimatedArrivalUtc { get; set; }
    public decimal DistanceKmFromPrevious { get; set; }
    public int DurationMinutesFromPrevious { get; set; }
    public bool IsViableWithRegulations { get; set; } = true;
    public string? RegulationWarning { get; set; }
}

public class RoutePlanResultDto
{
    public Guid VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public decimal TotalDistanceKm { get; set; }
    public int TotalDurationMinutes { get; set; }
    public decimal EstimatedFuelLitre { get; set; }
    public List<OptimizedStopDto> Stops { get; set; } = new();
    public int ViolationsCount { get; set; }
    public List<string> RegulationWarnings { get; set; } = new();
    public string Disclaimer { get; set; } = "Cự ly và mức tiêu hao nhiên liệu tính toán dựa trên mô hình đường bộ thực tế OSRM và định mức xe. Quy định cấm giờ cần chuyên gia pháp lý xác nhận.";
}
