using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class TenantMeteringRecord : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public int ActiveVehicleCount { get; set; }
    public int OrdersThisMonth { get; set; }
    public long IoTEventsToday { get; set; }
    public decimal StorageUsedMb { get; set; }

    public bool IsVehicleQuotaExceeded { get; set; }
    public bool IsOrderQuotaExceeded { get; set; }
    public string QuotaWarningDetails { get; set; } = string.Empty;

    public DateTime MeteredAtUtc { get; set; } = DateTime.UtcNow;
}
