using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using VDBus.Api.Hubs;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Telematics;

namespace VDBus.Api.Services;

public class SignalRTelematicsNotificationService : ITelematicsNotificationService
{
    private readonly IHubContext<TelematicsHub> _hubContext;

    public SignalRTelematicsNotificationService(IHubContext<TelematicsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task BroadcastTelemetryAsync(TelemetryDto telemetry, CancellationToken ct = default)
    {
        // Gửi tới toàn bộ client thuộc Tenant tương ứng
        await _hubContext.Clients.Group($"tenant_{telemetry.TenantId}")
            .SendAsync("ReceiveTelemetryUpdate", telemetry, cancellationToken: ct);

        // Gửi tới client đang theo dõi cụ thể phương tiện này
        if (!string.IsNullOrWhiteSpace(telemetry.LicensePlate))
        {
            await _hubContext.Clients.Group($"vehicle_{telemetry.LicensePlate.ToUpperInvariant()}")
                .SendAsync("ReceiveVehicleTelemetry", telemetry, cancellationToken: ct);
        }
    }
}
