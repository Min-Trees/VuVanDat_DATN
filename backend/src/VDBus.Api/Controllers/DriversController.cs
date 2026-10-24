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
public class DriversController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public DriversController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Driver>>> GetDrivers([FromQuery] string? status, CancellationToken ct)
    {
        var query = _context.Drivers.Include(d => d.AssignedVehicle).AsNoTracking();
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(d => d.Status == status);
        }

        var list = await query.OrderBy(d => d.FullName).ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Driver>> GetDriverById(Guid id, CancellationToken ct)
    {
        var driver = await _context.Drivers.Include(d => d.AssignedVehicle).FirstOrDefaultAsync(d => d.Id == id, ct);
        if (driver == null) return NotFound("Không tìm thấy thông tin tài xế.");
        return Ok(driver);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher,FleetManager")]
    public async Task<ActionResult<Driver>> CreateDriver([FromBody] Driver driver, CancellationToken ct)
    {
        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetDriverById), new { id = driver.Id }, driver);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Dispatcher,FleetManager")]
    public async Task<ActionResult<Driver>> UpdateDriver(Guid id, [FromBody] Driver update, CancellationToken ct)
    {
        var existing = await _context.Drivers.FirstOrDefaultAsync(d => d.Id == id, ct);
        if (existing == null) return NotFound("Không tìm thấy thông tin tài xế.");

        existing.FullName = update.FullName;
        existing.PhoneNumber = update.PhoneNumber;
        existing.Email = update.Email;
        existing.LicenseNumber = update.LicenseNumber;
        existing.LicenseClass = update.LicenseClass;
        existing.LicenseExpiryDate = update.LicenseExpiryDate;
        existing.Status = update.Status;
        existing.AssignedVehicleId = update.AssignedVehicleId;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return Ok(existing);
    }
}
