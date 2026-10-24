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
public class CustomersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public CustomersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Customer>>> GetCustomers(CancellationToken ct)
    {
        var customers = await _context.Customers
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync(ct);
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Customer>> GetCustomerById(Guid id, CancellationToken ct)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (customer == null) return NotFound("Không tìm thấy thông tin khách hàng.");
        return Ok(customer);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher,Accountant")]
    public async Task<ActionResult<Customer>> CreateCustomer([FromBody] Customer customer, CancellationToken ct)
    {
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetCustomerById), new { id = customer.Id }, customer);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Dispatcher,Accountant")]
    public async Task<ActionResult<Customer>> UpdateCustomer(Guid id, [FromBody] Customer update, CancellationToken ct)
    {
        var existing = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (existing == null) return NotFound("Không tìm thấy thông tin khách hàng.");

        existing.Name = update.Name;
        existing.TaxCode = update.TaxCode;
        existing.ContactPerson = update.ContactPerson;
        existing.PhoneNumber = update.PhoneNumber;
        existing.Email = update.Email;
        existing.Address = update.Address;
        existing.CreditLimitVnd = update.CreditLimitVnd;
        existing.PaymentTermDays = update.PaymentTermDays;
        existing.IsActive = update.IsActive;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return Ok(existing);
    }
}
