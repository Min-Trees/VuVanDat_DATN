using System;

namespace VDBus.Application.DTOs.Telematics;

public class GpsPointDto
{
    public string VehicleId { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double SpeedKmh { get; set; }
    public double HeadingDegrees { get; set; }
    public double? TemperatureCelsius { get; set; }
    public double? FuelLevelPercent { get; set; }
    public DateTime TimestampUtc { get; set; }
    public bool IsSimulated { get; set; } // true khi là simulator
}
