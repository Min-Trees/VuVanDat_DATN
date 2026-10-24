using System;

namespace VDBus.Application.Common.Interfaces;

public interface ICurrentTenantService
{
    Guid? TenantId { get; }
    void SetTenantId(Guid tenantId);
    string? UserId { get; }
    void SetUserId(string userId);
}
