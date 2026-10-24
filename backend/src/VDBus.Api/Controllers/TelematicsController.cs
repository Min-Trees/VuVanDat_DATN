using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Telematics;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TelematicsController : ControllerBase
{
    private readonly ITelematicsService _telematicsService;

    public TelematicsController(ITelematicsService telematicsService)
    {
        _telematicsService = telematicsService;
    }

    [HttpPost("ingest")]
    public async Task<ActionResult<TelemetryDto>> IngestTelemetry([FromBody] TelemetryDto telemetry, CancellationToken ct)
    {
        var result = await _telematicsService.IngestTelemetryAsync(telemetry, ct);
        return Ok(result);
    }

    [HttpGet("fleet-live")]
    public async Task<ActionResult<IReadOnlyList<TelemetryDto>>> GetFleetLiveLocations(CancellationToken ct)
    {
        var list = await _telematicsService.GetLatestFleetLocationsAsync(ct);
        return Ok(list);
    }

    [HttpGet("vehicle/{vehicleId}/history")]
    public async Task<ActionResult<IReadOnlyList<TelemetryDto>>> GetVehicleHistory(
        Guid vehicleId,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        CancellationToken ct)
    {
        var from = fromUtc ?? DateTime.UtcNow.AddHours(-24);
        var to = toUtc ?? DateTime.UtcNow;
        var history = await _telematicsService.GetVehicleTelemetryHistoryAsync(vehicleId, from, to, ct);
        return Ok(history);
    }
}
