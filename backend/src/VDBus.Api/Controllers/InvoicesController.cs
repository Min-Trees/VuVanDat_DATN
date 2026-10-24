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
using VDBus.Domain.Services;

namespace VDBus.Api.Controllers;

public class ReconcileInvoiceRequest
{
    public string PaymentReference { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin,Accountant,Dispatcher")]
public class InvoicesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public InvoicesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Invoice>>> GetInvoices([FromQuery] PaymentStatus? status, CancellationToken ct)
    {
        var query = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Order)
            .AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(i => i.Status == status.Value);
        }

        var list = await query.OrderByDescending(i => i.IssuedDateUtc).ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoiceById(Guid id, CancellationToken ct)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Order)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

        if (invoice == null) return NotFound("Không tìm thấy hóa đơn cước.");
        return Ok(invoice);
    }

    [HttpPost("{id}/reconcile")]
    public async Task<IActionResult> ReconcileAndMarkPaid(Guid id, [FromBody] ReconcileInvoiceRequest request, CancellationToken ct)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Order)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

        if (invoice == null) return NotFound("Không tìm thấy hóa đơn cước.");

        invoice.Status = PaymentStatus.Paid;
        invoice.PaymentDateUtc = DateTime.UtcNow;
        invoice.PaymentReference = request.PaymentReference;
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            invoice.Notes += $"; {request.Notes}";
        }

        // Chuyển trạng thái Order tương ứng sang Reconciled
        if (invoice.Order != null && (invoice.Order.Status == OrderStatus.Delivered || invoice.Order.Status == OrderStatus.PartiallyDelivered))
        {
            OrderStateMachine.Transition(invoice.Order, OrderStatus.Reconciled, UserRole.Accountant);
        }

        await _context.SaveChangesAsync(ct);

        return Ok(new
        {
            success = true,
            invoiceId = invoice.Id,
            invoiceCode = invoice.InvoiceCode,
            status = invoice.Status.ToString(),
            orderStatus = invoice.Order?.Status.ToString()
        });
    }
}
