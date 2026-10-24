using System;

namespace VDBus.Domain.Entities;

/// <summary>
/// Nhật ký kiểm toán bất biến (Immutable Audit Log).
/// Bảng chỉ hỗ trợ Insert, không cho phép Update hoặc Delete.
/// </summary>
public class AuditLog
{
    public long Id { get; set; }
    public Guid TenantId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Insert, Update, Delete
    public string? OldValues { get; set; } // JSON
    public string? NewValues { get; set; } // JSON
    public string? ChangedByUserId { get; set; }
    public DateTime ChangedAtUtc { get; set; } = DateTime.UtcNow;
}
