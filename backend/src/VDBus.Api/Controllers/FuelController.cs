using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Fuel;
using VDBus.Domain.Entities;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class FuelController : ControllerBase
{
    private readonly IFuelService _fuelService;
    private readonly IApplicationDbContext _context;

    public FuelController(IFuelService fuelService, IApplicationDbContext context)
    {
        _fuelService = fuelService;
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher,FleetManager,Driver")]
    public async Task<ActionResult<FuelRecordDto>> RecordFuelPurchase([FromBody] CreateFuelRecordRequestDto request, CancellationToken ct)
    {
        try
        {
            var result = await _fuelService.CreateFuelRecordAsync(request, ct);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FuelRecord>>> GetFuelRecords(
        [FromQuery] Guid? vehicleId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] bool? onlyAnomalies,
        CancellationToken ct)
    {
        var query = _context.FuelRecords.AsNoTracking();

        if (vehicleId.HasValue)
        {
            query = query.Where(r => r.VehicleId == vehicleId.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(r => r.PurchasedAtUtc >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(r => r.PurchasedAtUtc <= toDate.Value);
        }

        if (onlyAnomalies == true)
        {
            query = query.Where(r => r.AbnormalityScore > 0.2);
        }

        var records = await query
            .OrderByDescending(r => r.PurchasedAtUtc)
            .Take(100)
            .ToListAsync(ct);

        return Ok(records);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<FuelConsumptionSummaryDto>> GetConsumptionSummary(
        [FromQuery] Guid vehicleId,
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate,
        CancellationToken ct)
    {
        try
        {
            var summary = await _fuelService.GetVehicleConsumptionSummaryAsync(vehicleId, fromDate, toDate, ct);
            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
