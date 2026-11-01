using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;

namespace VDBus.Api.Controllers;

public class CreateMaintenanceOrderRequest
{
    public Guid VehicleId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public MaintenanceType MaintenanceType { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal TotalCostVnd { get; set; }
    public decimal OdometerKm { get; set; }
    public DateTime ScheduledDateUtc { get; set; }
    public string GarageName { get; set; } = string.Empty;
    public string PartsReplaced { get; set; } = string.Empty;
}

public class CompleteMaintenanceOrderRequest
{
    public decimal TotalCostVnd { get; set; }
    public string Description { get; set; } = string.Empty;
    public string PartsReplaced { get; set; } = string.Empty;
    public string InvoiceDocumentUrl { get; set; } = string.Empty;
    public decimal OdometerKm { get; set; }
}

public class CreateVehicleDocumentRequest
{
    public Guid VehicleId { get; set; }
    public DocumentType DocumentType { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime IssuedDateUtc { get; set; }
    public DateTime ExpiryDateUtc { get; set; }
    public int AlertBeforeDays { get; set; } = 30;
    public string FileScanUrl { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentTenantService _currentTenantService;

    public MaintenanceController(IApplicationDbContext context, ICurrentTenantService currentTenantService)
    {
        _context = context;
        _currentTenantService = currentTenantService;
    }

    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<MaintenanceOrder>>> GetMaintenanceOrders(
        [FromQuery] Guid? vehicleId,
        [FromQuery] string? status,
        CancellationToken ct)
    {
        var query = _context.MaintenanceOrders.AsNoTracking();

        if (vehicleId.HasValue)
        {
            query = query.Where(m => m.VehicleId == vehicleId.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(m => m.Status == status);
        }

        var list = await query
            .OrderByDescending(m => m.ScheduledDateUtc)
            .Take(100)
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpPost("orders")]
    [Authorize(Roles = "Admin,Dispatcher,FleetManager")]
    public async Task<ActionResult<MaintenanceOrder>> CreateMaintenanceOrder([FromBody] CreateMaintenanceOrderRequest req, CancellationToken ct)
    {
        var tenantId = _currentTenantService.TenantId ?? Guid.Empty;
        var order = new MaintenanceOrder
        {
            VehicleId = req.VehicleId,
            TenantId = tenantId,
            OrderCode = string.IsNullOrWhiteSpace(req.OrderCode) ? $"BD-{DateTime.UtcNow:yyyyMMddHHmmss}" : req.OrderCode,
            MaintenanceType = req.MaintenanceType,
            Description = req.Description,
            TotalCostVnd = req.TotalCostVnd,
            OdometerKm = req.OdometerKm,
            ScheduledDateUtc = req.ScheduledDateUtc,
            GarageName = req.GarageName,
            PartsReplaced = req.PartsReplaced,
            Status = "Scheduled",
            IsSimulated = true
        };

        _context.MaintenanceOrders.Add(order);
        await _context.SaveChangesAsync(ct);
        return Ok(order);
    }

    [HttpPut("orders/{id}/complete")]
    [Authorize(Roles = "Admin,Dispatcher,FleetManager")]
    public async Task<ActionResult<MaintenanceOrder>> CompleteMaintenanceOrder(Guid id, [FromBody] CompleteMaintenanceOrderRequest req, CancellationToken ct)
    {
        var order = await _context.MaintenanceOrders.FirstOrDefaultAsync(m => m.Id == id, ct);
        if (order == null) return NotFound("Không tìm thấy lệnh bảo dưỡng.");

        order.TotalCostVnd = req.TotalCostVnd;
        if (!string.IsNullOrWhiteSpace(req.Description)) order.Description = req.Description;
        if (!string.IsNullOrWhiteSpace(req.PartsReplaced)) order.PartsReplaced = req.PartsReplaced;
        order.InvoiceDocumentUrl = req.InvoiceDocumentUrl;
        order.CompletedDateUtc = DateTime.UtcNow;
        order.OdometerKm = req.OdometerKm;
        order.Status = "Completed";

        await _context.SaveChangesAsync(ct);
        return Ok(order);
    }

    [HttpGet("documents")]
    public async Task<ActionResult<IReadOnlyList<VehicleDocument>>> GetDocuments(
        [FromQuery] Guid? vehicleId,
        [FromQuery] bool? onlyExpiringSoon,
        CancellationToken ct)
    {
        var query = _context.VehicleDocuments.AsNoTracking();

        if (vehicleId.HasValue)
        {
            query = query.Where(d => d.VehicleId == vehicleId.Value);
        }

        if (onlyExpiringSoon == true)
        {
            var warningThreshold = DateTime.UtcNow.AddDays(30);
            query = query.Where(d => d.ExpiryDateUtc <= warningThreshold);
        }

        var list = await query
            .OrderBy(d => d.ExpiryDateUtc)
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpPost("documents")]
    [Authorize(Roles = "Admin,Dispatcher,FleetManager")]
    public async Task<ActionResult<VehicleDocument>> CreateDocument([FromBody] CreateVehicleDocumentRequest req, CancellationToken ct)
    {
        var tenantId = _currentTenantService.TenantId ?? Guid.Empty;
        var doc = new VehicleDocument
        {
            VehicleId = req.VehicleId,
            TenantId = tenantId,
            DocumentType = req.DocumentType,
            DocumentNumber = req.DocumentNumber,
            Issuer = req.Issuer,
            IssuedDateUtc = req.IssuedDateUtc,
            ExpiryDateUtc = req.ExpiryDateUtc,
            AlertBeforeDays = req.AlertBeforeDays,
            FileScanUrl = req.FileScanUrl,
            Notes = req.Notes,
            IsSimulated = true
        };

        _context.VehicleDocuments.Add(doc);
        await _context.SaveChangesAsync(ct);
        return Ok(doc);
    }
}
