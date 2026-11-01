using System;
using System.Collections.Generic;

namespace VDBus.Application.DTOs.Fuel;

public class CreateFuelRecordRequestDto
{
    public Guid VehicleId { get; set; }
    public Guid? DriverId { get; set; }
    public Guid? TripId { get; set; }
    public decimal OdometerKm { get; set; }
    public decimal FuelLitre { get; set; }
    public decimal UnitPriceVnd { get; set; }
    public string StationName { get; set; } = string.Empty;
    public decimal? SensorLitreBeforeRefuel { get; set; }
    public decimal? SensorLitreAfterRefuel { get; set; }
    public DateTime? PurchasedAtUtc { get; set; }
    public string ReceiptPhotoUrl { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public class FuelRecordDto
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;
    public Guid? DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public Guid? TripId { get; set; }
    public decimal OdometerKm { get; set; }
    public decimal FuelLitre { get; set; }
    public decimal UnitPriceVnd { get; set; }
    public decimal TotalAmountVnd { get; set; }
    public string StationName { get; set; } = string.Empty;
    public decimal? SensorLitreBeforeRefuel { get; set; }
    public decimal? SensorLitreAfterRefuel { get; set; }
    public double AbnormalityScore { get; set; }
    public string AbnormalityReason { get; set; } = string.Empty;
    public double ConfidenceRating { get; set; }
    public DateTime PurchasedAtUtc { get; set; }
    public bool IsSimulated { get; set; }
}

public class FuelConsumptionSummaryDto
{
    public Guid VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string MakeModel { get; set; } = string.Empty;
    public decimal StandardConsumptionLitrePer100Km { get; set; }
    public decimal ActualConsumptionLitrePer100Km { get; set; }
    public decimal TotalFuelLitre { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public decimal TotalFuelCostVnd { get; set; }
    public decimal VariancePercentage { get; set; }
    public int AbnormalEventsCount { get; set; }
    public string EvaluationStatus { get; set; } = "Normal"; // Normal, Warning, HighVariance
    public string EvaluationSummary { get; set; } = string.Empty;
}
