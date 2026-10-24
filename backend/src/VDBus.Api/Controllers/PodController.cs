using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Pod;
using VDBus.Domain.Entities;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PodController : ControllerBase
{
    private readonly IPodService _podService;

    public PodController(IPodService podService)
    {
        _podService = podService;
    }

    [HttpPost("submit")]
    [Authorize(Roles = "Driver,Admin,Dispatcher")]
    public async Task<ActionResult<PodRecord>> SubmitPod([FromBody] PodSubmissionDto request, CancellationToken ct)
    {
        var podRecord = await _podService.SubmitPodAsync(request, ct);
        return Ok(podRecord);
    }

    [HttpGet("verify/{orderId}")]
    [AllowAnonymous]
    public async Task<ActionResult<PodVerificationDto>> VerifyPod(Guid orderId, CancellationToken ct)
    {
        var verification = await _podService.VerifyPodIntegrityAsync(orderId, ct);
        return Ok(verification);
    }
}
