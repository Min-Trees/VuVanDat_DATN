using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public HealthController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetLiveness()
    {
        return Ok(new
        {
            status = "Healthy",
            timestampUtc = DateTime.UtcNow,
            service = "VDBus.Api",
            version = "1.0.0"
        });
    }

    [HttpGet("ready")]
    public async Task<IActionResult> GetReadiness(CancellationToken ct)
    {
        bool dbHealthy = false;
        string? dbError = null;

        try
        {
            dbHealthy = await _context.Tenants.Take(1).AnyAsync(ct) || true;
        }
        catch (Exception ex)
        {
            dbError = ex.Message;
        }

        var status = dbHealthy ? "Healthy" : "Degraded";

        return StatusCode(dbHealthy ? 200 : 503, new
        {
            status,
            database = dbHealthy ? "Connected" : $"Disconnected: {dbError}",
            timestampUtc = DateTime.UtcNow
        });
    }
}
