using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Telematics;

namespace VDBus.Application.Common.Interfaces;

public interface ITelematicsProvider
{
    bool IsMock { get; }
    Task<GpsPointDto> GetLatestVehicleTelemetryAsync(string vehicleId, CancellationToken ct = default);
}
