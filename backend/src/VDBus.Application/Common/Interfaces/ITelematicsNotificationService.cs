using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Telematics;

namespace VDBus.Application.Common.Interfaces;

public interface ITelematicsNotificationService
{
    Task BroadcastTelemetryAsync(TelemetryDto telemetry, CancellationToken ct = default);
}
