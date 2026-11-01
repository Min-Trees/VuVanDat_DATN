using System;
using VDBus.Domain.Common;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Entities;

public class MaintenanceOrder : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public string OrderCode { get; set; } = string.Empty; // e.g. BD-2026-001
    public MaintenanceType MaintenanceType { get; set; } = MaintenanceType.PeriodicCheck;
    public decimal OdometerKm { get; set; }
    public decimal TotalCostVnd { get; set; }
    public string GarageName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PartsReplaced { get; set; } = string.Empty; // Danh sách phụ tùng thay thế

    public DateTime ScheduledDateUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedDateUtc { get; set; }
    public string Status { get; set; } = "Completed"; // Scheduled, InProgress, Completed
    public string InvoiceDocumentUrl { get; set; } = string.Empty;
    public bool IsSimulated { get; set; } = true;
}
