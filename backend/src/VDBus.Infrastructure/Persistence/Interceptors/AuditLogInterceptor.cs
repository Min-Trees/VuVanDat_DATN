using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using VDBus.Application.Common.Interfaces;
using VDBus.Domain.Common;
using VDBus.Domain.Entities;

namespace VDBus.Infrastructure.Persistence.Interceptors;

public class AuditLogInterceptor : SaveChangesInterceptor
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    private readonly ICurrentTenantService _currentTenantService;

    public AuditLogInterceptor(ICurrentTenantService currentTenantService)
    {
        _currentTenantService = currentTenantService;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        ProcessAuditLogs(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        ProcessAuditLogs(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void ProcessAuditLogs(DbContext? context)
    {
        if (context == null) return;

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.Entity is not AuditLog &&
                        (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted))
            .ToList();

        if (!entries.Any()) return;

        var auditLogs = new List<AuditLog>();

        foreach (var entry in entries)
        {
            var entityName = entry.Metadata.ClrType.Name;
            var primaryKey = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey())?.CurrentValue?.ToString() ?? string.Empty;

            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();

            foreach (var property in entry.Properties)
            {
                if (property.Metadata.IsPrimaryKey() || property.Metadata.Name == "PasswordHash")
                    continue; // Không log password hash

                var propName = property.Metadata.Name;

                switch (entry.State)
                {
                    case EntityState.Added:
                        newValues[propName] = property.CurrentValue;
                        break;
                    case EntityState.Deleted:
                        oldValues[propName] = property.OriginalValue;
                        break;
                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            oldValues[propName] = property.OriginalValue;
                            newValues[propName] = property.CurrentValue;
                        }
                        break;
                }
            }

            Guid tenantId = Guid.Empty;
            if (entry.Entity is ITenantEntity tenantEntity)
            {
                // Tự động gán TenantId nếu là entity mới và chưa gán
                if (entry.State == EntityState.Added && tenantEntity.TenantId == Guid.Empty && _currentTenantService.TenantId.HasValue)
                {
                    tenantEntity.TenantId = _currentTenantService.TenantId.Value;
                }
                tenantId = tenantEntity.TenantId;
            }
            else if (_currentTenantService.TenantId.HasValue)
            {
                tenantId = _currentTenantService.TenantId.Value;
            }

            var auditLog = new AuditLog
            {
                TenantId = tenantId,
                EntityName = entityName,
                EntityId = primaryKey,
                Action = entry.State.ToString(),
                OldValues = oldValues.Count > 0 ? JsonSerializer.Serialize(oldValues, JsonOptions) : null,
                NewValues = newValues.Count > 0 ? JsonSerializer.Serialize(newValues, JsonOptions) : null,
                ChangedByUserId = _currentTenantService.UserId ?? "System",
                ChangedAtUtc = DateTime.UtcNow
            };

            auditLogs.Add(auditLog);
        }

        context.Set<AuditLog>().AddRange(auditLogs);
    }
}
