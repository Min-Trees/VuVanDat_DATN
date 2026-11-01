using System;
using System.Collections.Generic;
using VDBus.Domain.Enums;

namespace VDBus.Application.DTOs.Metering;

public class SubscriptionPlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public SubscriptionTier Tier { get; set; }
    public decimal MonthlyPriceVnd { get; set; }
    public int MaxVehicles { get; set; }
    public int MaxOrdersPerMonth { get; set; }
    public int MaxIoTEventsPerDay { get; set; }
    public int MaxStorageMb { get; set; }
    public string FeatureSummary { get; set; } = string.Empty;
}

public class TenantUsageMeteringDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string PlanName { get; set; } = "Gói Doanh nghiệp Tiêu chuẩn (Pro)";
    public SubscriptionTier PlanTier { get; set; } = SubscriptionTier.Pro;

    public int ActiveVehicles { get; set; }
    public int MaxVehicles { get; set; } = 25;
    public decimal VehicleUsagePercentage { get; set; }

    public int OrdersThisMonth { get; set; }
    public int MaxOrdersPerMonth { get; set; } = 1000;
    public decimal OrderUsagePercentage { get; set; }

    public long IoTEventsToday { get; set; }
    public int MaxIoTEventsPerDay { get; set; } = 50000;
    public decimal IoTUsagePercentage { get; set; }

    public decimal StorageUsedMb { get; set; }
    public int MaxStorageMb { get; set; } = 10240;
    public decimal StorageUsagePercentage { get; set; }

    public bool IsQuotaExceeded { get; set; }
    public string WarningMessage { get; set; } = string.Empty;
}
