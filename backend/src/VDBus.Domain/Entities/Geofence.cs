using System;
using System.Collections.Generic;
using VDBus.Domain.Common;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Entities;

public class Geofence : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public GeofenceType GeofenceType { get; set; } = GeofenceType.CustomerWarehouse;
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public double CenterLatitude { get; set; }
    public double CenterLongitude { get; set; }
    public double RadiusMeters { get; set; } = 300.0;
    public string? PolygonCoordinatesJson { get; set; } // GeoJSON hoặc tọa độ đa giác tùy biến
    public int FreeTimeMinutes { get; set; } = 60; // Thời gian đỗ miễn phí (phút)
    public decimal DetentionRatePerHourVnd { get; set; } = 150000m; // Đơn giá neo xe phạt theo giờ (VND)
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<DetentionRecord> DetentionRecords { get; set; } = new List<DetentionRecord>();
}
