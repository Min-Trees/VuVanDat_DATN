using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Vetc;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class VetcController : ControllerBase
{
    private readonly IVetcProvider _vetcProvider;

    public VetcController(IVetcProvider vetcProvider)
    {
        _vetcProvider = vetcProvider;
    }

    [HttpGet("transactions")]
    public async Task<ActionResult<IReadOnlyList<VetcTransactionDto>>> GetTransactions(
        [FromQuery] string licensePlate,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        CancellationToken ct)
    {
        var from = fromUtc ?? DateTime.UtcNow.AddDays(-7);
        var to = toUtc ?? DateTime.UtcNow;

        var transactions = await _vetcProvider.GetTransactionsByPlateAsync(licensePlate, from, to, ct);
        return Ok(transactions);
    }
}
