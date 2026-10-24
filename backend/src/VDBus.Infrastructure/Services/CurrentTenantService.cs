using System;
using VDBus.Application.Common.Interfaces;

namespace VDBus.Infrastructure.Services;

public class CurrentTenantService : ICurrentTenantService
{
    private Guid? _tenantId;
    private string? _userId;

    public Guid? TenantId => _tenantId;

    public string? UserId => _userId;

    public void SetTenantId(Guid tenantId)
    {
        _tenantId = tenantId;
    }

    public void SetUserId(string userId)
    {
        _userId = userId;
    }
}
