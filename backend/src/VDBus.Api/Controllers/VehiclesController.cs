using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Domain.Entities;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class VehiclesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public VehiclesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Vehicle>>> GetVehicles([FromQuery] string? status, CancellationToken ct)
    {
        var query = _context.Vehicles.AsNoTracking();
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(v => v.Status == status);
        }

        var list = await query.OrderBy(v => v.LicensePlate).ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Vehicle>> GetVehicleById(Guid id, CancellationToken ct)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id, ct);
        if (vehicle == null) return NotFound("Không tìm thấy thông tin phương tiện.");
        return Ok(vehicle);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher,FleetManager")]
    public async Task<ActionResult<Vehicle>> CreateVehicle([FromBody] Vehicle vehicle, CancellationToken ct)
    {
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetVehicleById), new { id = vehicle.Id }, vehicle);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Dispatcher,FleetManager")]
    public async Task<ActionResult<Vehicle>> UpdateVehicle(Guid id, [FromBody] Vehicle update, CancellationToken ct)
    {
        var existing = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id, ct);
        if (existing == null) return NotFound("Không tìm thấy thông tin phương tiện.");

        existing.LicensePlate = update.LicensePlate;
        existing.Type = update.Type;
        existing.MakeModel = update.MakeModel;
        existing.MaxPayloadKg = update.MaxPayloadKg;
        existing.CargoVolumeCbm = update.CargoVolumeCbm;
        existing.LengthMm = update.LengthMm;
        existing.WidthMm = update.WidthMm;
        existing.HeightMm = update.HeightMm;
        existing.AxleCount = update.AxleCount;
        existing.FuelConsumptionLitrePer100Km = update.FuelConsumptionLitrePer100Km;
        existing.Status = update.Status;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return Ok(existing);
    }
}
