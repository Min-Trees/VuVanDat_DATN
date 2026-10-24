using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class DetentionRecord : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid GeofenceId { get; set; }
    public Geofence? Geofence { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? TripId { get; set; }
    public Trip? Trip { get; set; }
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public DateTime ArrivedAtUtc { get; set; }
    public DateTime? DepartedAtUtc { get; set; }
    public int FreeTimeMinutes { get; set; }
    public int DetentionMinutes { get; set; }
    public decimal DetentionFeeVnd { get; set; }
    public string Status { get; set; } = "Tracking"; // Tracking, Billed, Waived
    public string? Notes { get; set; }
}
