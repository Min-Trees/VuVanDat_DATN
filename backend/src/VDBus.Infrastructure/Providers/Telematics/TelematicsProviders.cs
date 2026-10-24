using System;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Telematics;

namespace VDBus.Infrastructure.Providers.Telematics;

public class MockTelematicsProvider : ITelematicsProvider
{
    public bool IsMock => true;

    public Task<GpsPointDto> GetLatestVehicleTelemetryAsync(string vehicleId, CancellationToken ct = default)
    {
        // Tọa độ mô phỏng tại nút giao Cao tốc Pháp Vân (Hà Nội)
        var telemetry = new GpsPointDto
        {
            VehicleId = vehicleId,
            Latitude = 20.9572,
            Longitude = 105.8458,
            SpeedKmh = 68.5,
            HeadingDegrees = 180.0,
            TemperatureCelsius = 4.2, // Chuỗi lạnh
            FuelLevelPercent = 82.0,
            TimestampUtc = DateTime.UtcNow,
            IsSimulated = true
        };
        return Task.FromResult(telemetry);
    }
}

public class RealTelematicsProvider : ITelematicsProvider
{
    public bool IsMock => false;

    public Task<GpsPointDto> GetLatestVehicleTelemetryAsync(string vehicleId, CancellationToken ct = default)
    {
        // Khi cấu hình Real, đọc từ Redis / MQTT message stream thực
        var telemetry = new GpsPointDto
        {
            VehicleId = vehicleId,
            Latitude = 0,
            Longitude = 0,
            SpeedKmh = 0,
            HeadingDegrees = 0,
            TimestampUtc = DateTime.UtcNow,
            IsSimulated = false
        };
        return Task.FromResult(telemetry);
    }
}
