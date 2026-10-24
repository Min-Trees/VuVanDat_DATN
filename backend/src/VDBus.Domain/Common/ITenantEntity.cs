using System;

namespace VDBus.Domain.Common;

/// <summary>
/// Đánh dấu thực thể nghiệp vụ thuộc phạm vi một Tenant (đa thuê bao).
/// </summary>
public interface ITenantEntity
{
    Guid TenantId { get; set; }
}
