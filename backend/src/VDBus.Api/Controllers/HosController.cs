using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Hos;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class HosController : ControllerBase
{
    private readonly IHosService _hosService;

    public HosController(IHosService hosService)
    {
        _hosService = hosService;
    }

    [HttpGet("driver/{driverId}")]
    public async Task<ActionResult<HosStatusDto>> GetDriverHosStatus(Guid driverId, [FromQuery] DateTime? asOfUtc, CancellationToken ct)
    {
        var status = await _hosService.CalculateDriverHosStatusAsync(driverId, asOfUtc ?? DateTime.UtcNow, ct);
        return Ok(status);
    }

    [HttpGet("fleet-overview")]
    public async Task<ActionResult<IReadOnlyList<HosStatusDto>>> GetFleetHosOverview(CancellationToken ct)
    {
        var overview = await _hosService.GetFleetHosOverviewAsync(ct);
        return Ok(overview);
    }
}
