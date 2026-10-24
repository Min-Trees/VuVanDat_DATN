using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Domain.Entities;

namespace VDBus.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Tenant> Tenants { get; }
    DbSet<User> Users { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<RegulationRule> RegulationRules { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
