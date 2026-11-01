using System;
using VDBus.Domain.Common;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Entities;

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public SubscriptionTier Tier { get; set; } = SubscriptionTier.Pro;
    public decimal MonthlyPriceVnd { get; set; }
    public int MaxVehicles { get; set; }
    public int MaxOrdersPerMonth { get; set; }
    public int MaxIoTEventsPerDay { get; set; }
    public int MaxStorageMb { get; set; }
    public bool IsActive { get; set; } = true;
    public string FeatureSummary { get; set; } = string.Empty;
}
