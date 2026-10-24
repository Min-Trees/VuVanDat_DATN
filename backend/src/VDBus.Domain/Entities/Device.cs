using System;
using VDBus.Domain.Common;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Entities;

public class Device : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string SerialNumber { get; set; } = string.Empty; // IMEI hoặc Serial Number
    public string Name { get; set; } = string.Empty; // Tên thiết bị hiển thị
    public DeviceType DeviceType { get; set; } = DeviceType.GpsTracker;
    public Guid? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public int? BatteryPercentage { get; set; }
    public DateTime? LastHeartbeatUtc { get; set; }
    public bool IsActive { get; set; } = true;
    public string FirmwareVersion { get; set; } = "1.0.0";
    public bool IsSimulated { get; set; } = true; // Gắn nhãn dữ liệu mô phỏng
}
