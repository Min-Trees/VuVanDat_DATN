using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Dispatch;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Domain.Services;

namespace VDBus.Api.Controllers;

public class AssignDispatchDto
{
    public Guid OrderId { get; set; }
    public Guid VehicleId { get; set; }
    public Guid DriverId { get; set; }
    public string? Notes { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin,Dispatcher")]
public class DispatchController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IDispatchRecommendationService _dispatchService;

    public DispatchController(
        IApplicationDbContext context,
        IDispatchRecommendationService dispatchService)
    {
        _context = context;
        _dispatchService = dispatchService;
    }

    [HttpGet("recommendations/{orderId}")]
    public async Task<ActionResult<DispatchRecommendationResultDto>> GetRecommendations(Guid orderId, CancellationToken ct)
    {
        var result = await _dispatchService.GetRecommendationsForOrderAsync(orderId, ct);
        return Ok(result);
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignVehicleAndDriver([FromBody] AssignDispatchDto request, CancellationToken ct)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == request.OrderId, ct);
        if (order == null) return NotFound("Không tìm thấy đơn hàng.");

        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == request.VehicleId, ct);
        if (vehicle == null) return NotFound("Không tìm thấy phương tiện.");

        var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.Id == request.DriverId, ct);
        if (driver == null) return NotFound("Không tìm thấy tài xế.");

        // Tạo chuyến xe mới (Trip)
        var tripCode = $"CH-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var trip = new Trip
        {
            TenantId = order.TenantId,
            TripCode = tripCode,
            VehicleId = vehicle.Id,
            DriverId = driver.Id,
            Status = TripStatus.Scheduled,
            StartTimeUtc = order.PickupWindowStartUtc,
            Notes = request.Notes ?? $"Chuyến xe điều phối cho đơn {order.OrderCode}"
        };

        // Tạo 2 điểm dừng chuẩn: Điểm lấy (Pickup) và Điểm giao (Delivery)
        trip.Stops.Add(new Stop
        {
            TenantId = order.TenantId,
            StopOrder = 1,
            StopType = "Pickup",
            Address = order.PickupAddress,
            Latitude = order.PickupLat,
            Longitude = order.PickupLng,
            ScheduledArrivalUtc = order.PickupWindowStartUtc,
            ContactPerson = order.PickupContactName,
            ContactPhone = order.PickupContactPhone
        });

        trip.Stops.Add(new Stop
        {
            TenantId = order.TenantId,
            StopOrder = 2,
            StopType = "Delivery",
            Address = order.DeliveryAddress,
            Latitude = order.DeliveryLat,
            Longitude = order.DeliveryLng,
            ScheduledArrivalUtc = order.DeliveryWindowStartUtc,
            ContactPerson = order.DeliveryContactName,
            ContactPhone = order.DeliveryContactPhone
        });

        _context.Trips.Add(trip);

        // Chuyển trạng thái Order sang Assigned
        order.TripId = trip.Id;
        OrderStateMachine.Transition(order, OrderStatus.Assigned, UserRole.Dispatcher);

        // Cập nhật trạng thái xe và tài xế
        vehicle.Status = "OnTrip";
        driver.Status = "OnTrip";

        await _context.SaveChangesAsync(ct);

        return Ok(new
        {
            success = true,
            orderId = order.Id,
            tripId = trip.Id,
            tripCode = trip.TripCode,
            assignedVehicle = vehicle.LicensePlate,
            assignedDriver = driver.FullName,
            orderStatus = order.Status.ToString()
        });
    }
}
