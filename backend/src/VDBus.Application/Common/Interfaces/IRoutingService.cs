using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Routing;

namespace VDBus.Application.Common.Interfaces;

public interface IRoutingService
{
    Task<RoutePlanResultDto> OptimizeMultiStopRouteAsync(OptimizeRouteRequestDto request, CancellationToken ct = default);
    decimal CalculateRoadDistanceKm(double lat1, double lon1, double lat2, double lon2);
}
