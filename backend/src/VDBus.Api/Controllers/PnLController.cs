using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.PnL;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin,Accountant,Dispatcher")]
public class PnLController : ControllerBase
{
    private readonly IPnLService _pnLService;

    public PnLController(IPnLService pnLService)
    {
        _pnLService = pnLService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<PnLSummaryDto>> GetOverallSummary(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? vehicleId,
        [FromQuery] Guid? customerId,
        CancellationToken ct)
    {
        var filter = new PnLReportFilterDto
        {
            FromUtc = fromDate ?? DateTime.UtcNow.AddMonths(-1),
            ToUtc = toDate ?? DateTime.UtcNow,
            VehicleId = vehicleId,
            CustomerId = customerId
        };

        var result = await _pnLService.GetOverallPnLSummaryAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("by-vehicle")]
    public async Task<ActionResult<IReadOnlyList<VehiclePnLDto>>> GetPnLByVehicle(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? customerId,
        CancellationToken ct)
    {
        var filter = new PnLReportFilterDto
        {
            FromUtc = fromDate ?? DateTime.UtcNow.AddMonths(-1),
            ToUtc = toDate ?? DateTime.UtcNow,
            CustomerId = customerId
        };

        var result = await _pnLService.GetVehiclePnLBreakdownAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("by-trip")]
    public async Task<ActionResult<IReadOnlyList<TripPnLDto>>> GetPnLByTrip(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? vehicleId,
        [FromQuery] Guid? customerId,
        CancellationToken ct)
    {
        var filter = new PnLReportFilterDto
        {
            FromUtc = fromDate ?? DateTime.UtcNow.AddMonths(-1),
            ToUtc = toDate ?? DateTime.UtcNow,
            VehicleId = vehicleId,
            CustomerId = customerId
        };

        var result = await _pnLService.GetTripPnLBreakdownAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("by-customer")]
    public async Task<ActionResult<IReadOnlyList<CustomerPnLDto>>> GetPnLByCustomer(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? vehicleId,
        CancellationToken ct)
    {
        var filter = new PnLReportFilterDto
        {
            FromUtc = fromDate ?? DateTime.UtcNow.AddMonths(-1),
            ToUtc = toDate ?? DateTime.UtcNow,
            VehicleId = vehicleId
        };

        var result = await _pnLService.GetCustomerPnLBreakdownAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("by-route")]
    public async Task<ActionResult<IReadOnlyList<RoutePnLDto>>> GetPnLByRoute(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken ct)
    {
        var filter = new PnLReportFilterDto
        {
            FromUtc = fromDate ?? DateTime.UtcNow.AddMonths(-1),
            ToUtc = toDate ?? DateTime.UtcNow
        };

        var result = await _pnLService.GetRoutePnLBreakdownAsync(filter, ct);
        return Ok(result);
    }
}
