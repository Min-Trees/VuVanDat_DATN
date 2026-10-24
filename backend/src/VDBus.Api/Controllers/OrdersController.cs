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

public class OrderTransitionRequest
{
    public OrderStatus TargetStatus { get; set; }
    public string? Reason { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public OrdersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<Order>>> GetOrders(
        [FromQuery] OrderStatus? status,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var query = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Trip)
                .ThenInclude(t => t!.Vehicle)
            .Include(o => o.Trip)
                .ThenInclude(t => t!.Driver)
            .AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        if (!string.IsNullOrEmpty(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(o => o.OrderCode.ToLower().Contains(s) ||
                                     o.PickupAddress.ToLower().Contains(s) ||
                                     o.DeliveryAddress.ToLower().Contains(s));
        }

        var list = await query.OrderByDescending(o => o.CreatedAtUtc).ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<Order>> GetOrderById(Guid id, CancellationToken ct)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .Include(o => o.Trip)
                .ThenInclude(t => t!.Vehicle)
            .Include(o => o.Trip)
                .ThenInclude(t => t!.Driver)
            .Include(o => o.PodRecord)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

        if (order == null) return NotFound("Không tìm thấy đơn hàng.");
        return Ok(order);
    }

    [HttpGet("track/{trackingToken}")]
    [AllowAnonymous]
    public async Task<IActionResult> TrackPublicByToken(string trackingToken, CancellationToken ct)
    {
        // Tra cứu công khai cho chủ hàng bằng mã token bảo mật >= 128 bit
        var order = await _context.Orders
            .IgnoreQueryFilters()
            .Include(o => o.Customer)
            .Include(o => o.Trip)
                .ThenInclude(t => t!.Vehicle)
            .Include(o => o.Trip)
                .ThenInclude(t => t!.Driver)
            .Include(o => o.PodRecord)
            .FirstOrDefaultAsync(o => o.TrackingToken == trackingToken, ct);

        if (order == null)
        {
            return NotFound("Mã tra cứu không hợp lệ hoặc đã hết hạn.");
        }

        // Che mờ thông tin nhạy cảm bảo vệ dữ liệu cá nhân
        string maskedDriver = "Tài xế VDBus";
        if (order.Trip?.Driver != null)
        {
            var names = order.Trip.Driver.FullName.Split(' ');
            maskedDriver = names.Length > 1
                ? $"{names[0]} {names[1][0]}."
                : names[0];
        }

        string maskedPlate = "Xe VDBus";
        if (order.Trip?.Vehicle != null)
        {
            var plate = order.Trip.Vehicle.LicensePlate;
            maskedPlate = plate.Length > 4 ? $"{plate[..3]}-***{plate[^2..]}" : plate;
        }

        // Làm tròn tọa độ bảo mật
        double roundedLat = Math.Round(order.Trip?.Vehicle?.CurrentLocationLat ?? order.DeliveryLat, 3);
        double roundedLng = Math.Round(order.Trip?.Vehicle?.CurrentLocationLng ?? order.DeliveryLng, 3);

        return Ok(new
        {
            orderCode = order.OrderCode,
            status = order.Status.ToString(),
            pickupAddress = order.PickupAddress,
            deliveryAddress = order.DeliveryAddress,
            pickupWindow = $"{order.PickupWindowStartUtc:dd/MM HH:mm} - {order.PickupWindowEndUtc:HH:mm}",
            deliveryWindow = $"{order.DeliveryWindowStartUtc:dd/MM HH:mm} - {order.DeliveryWindowEndUtc:HH:mm}",
            totalWeightKg = order.TotalWeightKg,
            driverMasked = maskedDriver,
            vehiclePlateMasked = maskedPlate,
            approximateLatitude = roundedLat,
            approximateLongitude = roundedLng,
            hasPod = order.PodRecord != null,
            podVerificationHash = order.PodRecord?.HashSha256,
            isSimulated = order.Trip?.Vehicle?.IsSimulated ?? true
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher,Shipper")]
    public async Task<ActionResult<Order>> CreateOrder([FromBody] Order order, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(order.OrderCode))
        {
            order.OrderCode = $"DH-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        }
        order.Status = OrderStatus.Draft;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
    }

    [HttpPost("{id}/transition")]
    [Authorize]
    public async Task<IActionResult> TransitionStatus(Guid id, [FromBody] OrderTransitionRequest request, CancellationToken ct)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
        if (order == null) return NotFound("Không tìm thấy đơn hàng.");

        // Xác định actor role từ JWT claim
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (!Enum.TryParse<UserRole>(roleClaim, out var actorRole))
        {
            actorRole = UserRole.Dispatcher; // Mặc định
        }

        OrderStateMachine.Transition(order, request.TargetStatus, actorRole, request.Reason);
        await _context.SaveChangesAsync(ct);

        return Ok(new
        {
            orderId = order.Id,
            newStatus = order.Status.ToString(),
            updatedAtUtc = order.UpdatedAtUtc
        });
    }
}
