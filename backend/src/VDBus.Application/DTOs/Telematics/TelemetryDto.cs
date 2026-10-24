using System;
using System.Collections.Generic;

namespace VDBus.Application.DTOs.Telematics;

public class TirePressureItemDto
{
    public string Position { get; set; } = string.Empty; // e.g. "FrontLeft", "FrontRight", "RearAxle1LeftOuter"
    public double PressurePsi { get; set; } // Normal ~110 - 120 PSI for heavy trucks
    public double TemperatureCelsius { get; set; } // e.g. 40 - 55 C
    public string Status { get; set; } = "Normal"; // Normal, LowPressure, HighPressure, HighTemp
}

public class TelemetryDto
{
    public Guid TenantId { get; set; }
    public Guid VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public Guid? DeviceId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double SpeedKmh { get; set; }
    public double HeadingDegrees { get; set; }
    public double? TemperatureCelsius { get; set; } // Chuỗi lạnh (-25C to +10C)
    public double? HumidityPercentage { get; set; }
    public double? FuelLevelPercentage { get; set; }
    public List<TirePressureItemDto> TirePressures { get; set; } = new();
    public string? TirePressuresJson { get; set; }
    public bool? IsDoorOpen { get; set; }
    public DateTime RecordedAtUtc { get; set; }
    public bool IsSimulated { get; set; } = true;
}
