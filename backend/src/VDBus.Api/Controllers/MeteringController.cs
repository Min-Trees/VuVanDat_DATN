using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Metering;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class MeteringController : ControllerBase
{
    private readonly IMeteringService _meteringService;

    public MeteringController(IMeteringService meteringService)
    {
        _meteringService = meteringService;
    }

    [HttpGet("usage")]
    public async Task<ActionResult<TenantUsageMeteringDto>> GetUsage(CancellationToken ct)
    {
        var usage = await _meteringService.GetTenantUsageMeteringAsync(null, ct);
        return Ok(usage);
    }

    [HttpGet("plans")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<SubscriptionPlanDto>>> GetPlans(CancellationToken ct)
    {
        var plans = await _meteringService.GetSubscriptionPlansAsync(ct);
        return Ok(plans);
    }

    [HttpGet("check-quota")]
    public async Task<ActionResult<object>> CheckQuota(CancellationToken ct)
    {
        var canVehicle = await _meteringService.CanCreateVehicleAsync(null, ct);
        var canOrder = await _meteringService.CanCreateOrderAsync(null, ct);
        return Ok(new
        {
            CanCreateVehicle = canVehicle,
            CanCreateOrder = canOrder
        });
    }
}
