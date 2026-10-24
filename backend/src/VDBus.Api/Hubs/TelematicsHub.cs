using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using VDBus.Application.DTOs.Telematics;

namespace VDBus.Api.Hubs;

public class TelematicsHub : Hub
{
    public async Task JoinTenantFleet(string tenantId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
    }

    public async Task LeaveTenantFleet(string tenantId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
    }

    public async Task TrackVehicle(string vehiclePlate)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"vehicle_{vehiclePlate.ToUpperInvariant()}");
    }

    public async Task UntrackVehicle(string vehiclePlate)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"vehicle_{vehiclePlate.ToUpperInvariant()}");
    }
}
