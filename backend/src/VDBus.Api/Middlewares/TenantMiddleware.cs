using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using VDBus.Application.Common.Interfaces;

namespace VDBus.Api.Middlewares;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ICurrentTenantService currentTenantService)
    {
        // 1. Thử đọc tenant_id từ JWT Claim
        var tenantClaim = context.User.FindFirst("tenant_id")?.Value;
        if (!string.IsNullOrEmpty(tenantClaim) && Guid.TryParse(tenantClaim, out var tenantId))
        {
            currentTenantService.SetTenantId(tenantId);
        }
        // 2. Thử đọc từ Header X-Tenant-Id (dùng cho cổng công khai hoặc webhook nếu có)
        else if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var headerTenant) &&
                 Guid.TryParse(headerTenant, out var headerTenantId))
        {
            currentTenantService.SetTenantId(headerTenantId);
        }

        // Đọc User Id
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            currentTenantService.SetUserId(userId);
        }

        await _next(context);
    }
}
