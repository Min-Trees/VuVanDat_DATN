using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Domain.Services;

namespace VDBus.Api.Controllers;

public class AdvanceTripStatusRequest
{
    public OrderStatus TargetStatus { get; set; }
    public string? Reason { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TripsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public TripsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Trip>>> GetTrips([FromQuery] TripStatus? status, CancellationToken ct)
    {
        var query = _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .Include(t => t.Orders)
            .Include(t => t.Stops)
            .AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        var list = await query.OrderByDescending(t => t.CreatedAtUtc).ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Trip>> GetTripById(Guid id, CancellationToken ct)
    {
        var trip = await _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .Include(t => t.Orders)
            .Include(t => t.Stops)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

        if (trip == null) return NotFound("Không tìm thấy chuyến xe.");
        return Ok(trip);
    }

    [HttpGet("driver/active")]
    [Authorize(Roles = "Driver,Admin,Dispatcher")]
    public async Task<ActionResult<Trip>> GetDriverActiveTrip(CancellationToken ct)
    {
        // Lấy chuyến xe đang thực hiện cho tài xế đăng nhập
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Email == email, ct);

        IQueryable<Trip> query = _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Orders)
            .Include(t => t.Stops)
            .Where(t => t.Status == TripStatus.Scheduled || t.Status == TripStatus.InProgress);

        if (driver != null)
        {
            query = query.Where(t => t.DriverId == driver.Id);
        }

        var activeTrip = await query.OrderBy(t => t.CreatedAtUtc).FirstOrDefaultAsync(ct);
        if (activeTrip == null) return NotFound("Tài xế hiện không có chuyến xe nào đang hoạt động.");
        return Ok(activeTrip);
    }

    [HttpPost("{id}/advance-status")]
    [Authorize(Roles = "Driver,Admin,Dispatcher")]
    public async Task<IActionResult> AdvanceTripStatus(Guid id, [FromBody] AdvanceTripStatusRequest request, CancellationToken ct)
    {
        var trip = await _context.Trips
            .Include(t => t.Orders)
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

        if (trip == null) return NotFound("Không tìm thấy chuyến xe.");

        // Chuyển trạng thái các đơn hàng thuộc chuyến
        foreach (var order in trip.Orders)
        {
            OrderStateMachine.Transition(order, request.TargetStatus, UserRole.Driver, request.Reason);
        }

        // Cập nhật trạng thái chuyến xe
        if (request.TargetStatus == OrderStatus.InTransitToPickup)
        {
            trip.Status = TripStatus.InProgress;
            trip.StartTimeUtc ??= DateTime.UtcNow;
        }
        else if (request.TargetStatus == OrderStatus.Delivered)
        {
            trip.Status = TripStatus.Completed;
            trip.EndTimeUtc = DateTime.UtcNow;
            if (trip.Vehicle != null) trip.Vehicle.Status = "Available";
            if (trip.Driver != null) trip.Driver.Status = "Available";
        }

        await _context.SaveChangesAsync(ct);

        return Ok(new
        {
            success = true,
            tripId = trip.Id,
            tripStatus = trip.Status.ToString(),
            orderStatus = request.TargetStatus.ToString()
        });
    }
}
