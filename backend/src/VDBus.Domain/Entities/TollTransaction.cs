using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class TollTransaction : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string TransactionCode { get; set; } = string.Empty; // Mã giao dịch trừ tiền ETC
    public string StationName { get; set; } = string.Empty; // Tên trạm BOT
    public string TollProvider { get; set; } = "VETC"; // VETC hoặc ePass
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? TripId { get; set; }
    public Trip? Trip { get; set; }
    public decimal AmountVnd { get; set; }
    public DateTime PassedAtUtc { get; set; }
    public bool IsReconciled { get; set; } = false;
    public bool IsSimulated { get; set; } = true;
    public string? Notes { get; set; }
}
