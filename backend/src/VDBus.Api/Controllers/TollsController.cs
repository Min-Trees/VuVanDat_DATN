using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Toll;
using VDBus.Domain.Entities;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TollsController : ControllerBase
{
    private readonly ITollReconciliationService _tollService;

    public TollsController(ITollReconciliationService tollService)
    {
        _tollService = tollService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TollTransaction>>> GetTransactions(
        [FromQuery] Guid? tripId,
        [FromQuery] string? licensePlate,
        CancellationToken ct)
    {
        var list = await _tollService.GetTollTransactionsAsync(tripId, licensePlate, ct);
        return Ok(list);
    }

    [HttpPost("reconcile-trip/{tripId}")]
    [Authorize(Roles = "Admin,Accountant,Dispatcher")]
    public async Task<ActionResult<TollReconciliationResultDto>> ReconcileTripTolls(Guid tripId, CancellationToken ct)
    {
        var result = await _tollService.SyncAndReconcileTripTollsAsync(tripId, ct);
        return Ok(result);
    }
}
