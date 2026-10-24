using System;
using System.Collections.Generic;
using VDBus.Domain.Common;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Entities;

public class Order : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string OrderCode { get; set; } = string.Empty; // Mã đơn hàng (DH-2026-0001)
    public Guid CustomerId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Draft;

    // Yêu cầu phương tiện & tải trọng
    public VehicleType RequiredVehicleType { get; set; } = VehicleType.MediumTruck;
    public decimal TotalWeightKg { get; set; }
    public decimal TotalVolumeCbm { get; set; }

    // Điểm lấy hàng
    public string PickupAddress { get; set; } = string.Empty;
    public double PickupLat { get; set; }
    public double PickupLng { get; set; }
    public DateTime PickupWindowStartUtc { get; set; }
    public DateTime PickupWindowEndUtc { get; set; }
    public string PickupContactName { get; set; } = string.Empty;
    public string PickupContactPhone { get; set; } = string.Empty;

    // Điểm giao hàng
    public string DeliveryAddress { get; set; } = string.Empty;
    public double DeliveryLat { get; set; }
    public double DeliveryLng { get; set; }
    public DateTime DeliveryWindowStartUtc { get; set; }
    public DateTime DeliveryWindowEndUtc { get; set; }
    public string DeliveryContactName { get; set; } = string.Empty;
    public string DeliveryContactPhone { get; set; } = string.Empty;

    // Tài chính
    public decimal FreightAmountVnd { get; set; }

    // Ghi chú & Token tra cứu công khai (>= 128 bit, url-safe)
    public string Notes { get; set; } = string.Empty;
    public string TrackingToken { get; set; } = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

    // Liên kết chuyến xe
    public Guid? TripId { get; set; }

    // Ngoại lệ
    public string? CancellationReason { get; set; }
    public string? RejectionReason { get; set; }
    public string? PartialDeliveryNote { get; set; }

    // Navigation
    public Customer? Customer { get; set; }
    public Trip? Trip { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public PodRecord? PodRecord { get; set; }
}
