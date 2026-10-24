using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Routing;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class RoutingController : ControllerBase
{
    private readonly IRoutingService _routingService;

    public RoutingController(IRoutingService routingService)
    {
        _routingService = routingService;
    }

    [HttpPost("optimize")]
    public async Task<ActionResult<RoutePlanResultDto>> OptimizeRoute(
        [FromBody] OptimizeRouteRequestDto request,
        CancellationToken ct)
    {
        var result = await _routingService.OptimizeMultiStopRouteAsync(request, ct);
        return Ok(result);
    }
}
