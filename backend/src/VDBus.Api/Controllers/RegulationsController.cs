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
public class RegulationsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public RegulationsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RegulationRule>>> GetRules(CancellationToken ct)
    {
        // Nhờ Global Query Filter trong ApplicationDbContext, chỉ trả về rules của Tenant hiện tại
        var rules = await _context.RegulationRules.ToListAsync(ct);
        return Ok(rules);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<RegulationRule>> CreateRule([FromBody] RegulationRule rule, CancellationToken ct)
    {
        // Đảm bảo ghi chú pháp lý chuẩn xác
        rule.LegalNote = "Cần chuyên gia pháp lý xác nhận trước khi áp dụng chính thức";
        _context.RegulationRules.Add(rule);
        await _context.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetRules), new { id = rule.Id }, rule);
    }
}
