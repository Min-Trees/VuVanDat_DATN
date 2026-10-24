using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class OrderItem : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid OrderId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public string Unit { get; set; } = "Kiện"; // Kiện, Pallet, Thùng, Tấn
    public decimal WeightKg { get; set; }
    public decimal VolumeCbm { get; set; }
    public bool IsFragile { get; set; } = false; // Hàng dễ vỡ
    public string Notes { get; set; } = string.Empty;

    // Navigation
    public Order? Order { get; set; }
}
