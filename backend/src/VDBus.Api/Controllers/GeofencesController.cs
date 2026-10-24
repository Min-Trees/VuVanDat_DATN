using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Domain.Entities;

namespace VDBus.Api.Controllers;

public class TestLocationPingRequest
{
    public Guid VehicleId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime? TimestampUtc { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class GeofencesController : ControllerBase
{
    private readonly IGeofenceService _geofenceService;

    public GeofencesController(IGeofenceService geofenceService)
    {
        _geofenceService = geofenceService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Geofence>>> GetGeofences(CancellationToken ct)
    {
        var list = await _geofenceService.GetGeofencesAsync(ct);
        return Ok(list);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<Geofence>> CreateGeofence([FromBody] Geofence geofence, CancellationToken ct)
    {
        var created = await _geofenceService.CreateGeofenceAsync(geofence, ct);
        return Ok(created);
    }

    [HttpGet("detention-records")]
    public async Task<ActionResult<IReadOnlyList<DetentionRecord>>> GetDetentionRecords([FromQuery] string? status, CancellationToken ct)
    {
        var list = await _geofenceService.GetDetentionRecordsAsync(status, ct);
        return Ok(list);
    }

    [HttpPost("test-ping")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<DetentionRecord?>> TestLocationPing([FromBody] TestLocationPingRequest request, CancellationToken ct)
    {
        var record = await _geofenceService.ProcessVehicleLocationAsync(
            request.VehicleId,
            request.Latitude,
            request.Longitude,
            request.TimestampUtc ?? DateTime.UtcNow,
            ct);
        return Ok(record);
    }
}
