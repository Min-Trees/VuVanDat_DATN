using System;
using System.Collections.Generic;

namespace VDBus.Application.DTOs.PnL;

public class PnLReportFilterDto
{
    public DateTime FromUtc { get; set; } = DateTime.UtcNow.AddMonths(-1);
    public DateTime ToUtc { get; set; } = DateTime.UtcNow;
    public Guid? VehicleId { get; set; }
    public Guid? CustomerId { get; set; }
}

public class PnLSummaryDto
{
    public DateTime FromUtc { get; set; }
    public DateTime ToUtc { get; set; }
    public decimal FreightRevenueVnd { get; set; }
    public decimal DetentionRevenueVnd { get; set; }
    public decimal TotalRevenueVnd { get; set; }

    public decimal FuelCostVnd { get; set; }
    public decimal TollCostVnd { get; set; }
    public decimal DriverWageCostVnd { get; set; }
    public decimal MaintenanceCostVnd { get; set; }
    public decimal TotalCostVnd { get; set; }

    public decimal GrossProfitVnd { get; set; }
    public decimal GrossMarginPercentage { get; set; }
    public int TotalTripsCompleted { get; set; }
    public decimal TotalDistanceKm { get; set; }
}

public class VehiclePnLDto
{
    public Guid VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string MakeModel { get; set; } = string.Empty;
    public int TripCount { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public decimal RevenueVnd { get; set; }
    public decimal FuelCostVnd { get; set; }
    public decimal TollCostVnd { get; set; }
    public decimal DriverWageVnd { get; set; }
    public decimal MaintenanceCostVnd { get; set; }
    public decimal TotalCostVnd { get; set; }
    public decimal NetProfitVnd { get; set; }
    public decimal MarginPercentage { get; set; }
}

public class TripPnLDto
{
    public Guid TripId { get; set; }
    public string TripCode { get; set; } = string.Empty;
    public string VehiclePlate { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public decimal DistanceKm { get; set; }
    public decimal RevenueVnd { get; set; }
    public decimal FuelCostVnd { get; set; }
    public decimal TollCostVnd { get; set; }
    public decimal DriverWageVnd { get; set; }
    public decimal TotalCostVnd { get; set; }
    public decimal NetProfitVnd { get; set; }
    public decimal MarginPercentage { get; set; }
}

public class CustomerPnLDto
{
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerCode { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal FreightRevenueVnd { get; set; }
    public decimal DetentionRevenueVnd { get; set; }
    public decimal TotalRevenueVnd { get; set; }
    public decimal EstimatedDirectCostVnd { get; set; }
    public decimal NetProfitVnd { get; set; }
    public decimal MarginPercentage { get; set; }
}

public class RoutePnLDto
{
    public string RouteName { get; set; } = string.Empty; // e.g. "Đà Nẵng - Quảng Nam"
    public int TotalTrips { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public decimal RevenueVnd { get; set; }
    public decimal TotalCostVnd { get; set; }
    public decimal NetProfitVnd { get; set; }
    public decimal MarginPercentage { get; set; }
}
