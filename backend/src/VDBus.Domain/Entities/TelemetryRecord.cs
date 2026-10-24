using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class TelemetryRecord : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid? DeviceId { get; set; }
    public Device? Device { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public DateTime RecordedAtUtc { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double SpeedKmh { get; set; }
    public double HeadingDegrees { get; set; }
    public double? TemperatureCelsius { get; set; } // Giám sát chuỗi lạnh
    public double? HumidityPercentage { get; set; }
    public double? FuelLevelPercentage { get; set; } // Giám sát mức nhiên liệu
    public string? TirePressuresJson { get; set; } // Giám sát áp suất lốp TPMS theo từng vị trí trục
    public bool? IsDoorOpen { get; set; } // Cảm biến mở/đóng cửa thùng xe
    public bool IsSimulated { get; set; } = true; // Dữ liệu telemetry mô phỏng
}
