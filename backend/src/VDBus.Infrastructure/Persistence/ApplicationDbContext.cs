using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Domain.Entities;
using VDBus.Infrastructure.Persistence.Interceptors;

namespace VDBus.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ICurrentTenantService _currentTenantService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentTenantService currentTenantService)
        : base(options)
    {
        _currentTenantService = currentTenantService;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<RegulationRule> RegulationRules => Set<RegulationRule>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(new AuditLogInterceptor(_currentTenantService));
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tenant Configuration
        modelBuilder.Entity<Tenant>(b =>
        {
            b.HasKey(t => t.Id);
            b.Property(t => t.Name).IsRequired().HasMaxLength(200);
            b.Property(t => t.Code).IsRequired().HasMaxLength(50);
            b.HasIndex(t => t.Code).IsUnique();
        });

        // User Configuration
        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.Property(u => u.Email).IsRequired().HasMaxLength(150);
            b.Property(u => u.FullName).IsRequired().HasMaxLength(150);
            b.HasIndex(u => new { u.TenantId, u.Email }).IsUnique();

            // Multi-tenancy Query Filter: Cách ly theo Tenant
            b.HasQueryFilter(u => !_currentTenantService.TenantId.HasValue || u.TenantId == _currentTenantService.TenantId.Value);
        });

        // RegulationRule Configuration
        modelBuilder.Entity<RegulationRule>(b =>
        {
            b.HasKey(r => r.Id);
            b.Property(r => r.ProvinceCode).IsRequired().HasMaxLength(10);
            b.Property(r => r.RouteName).IsRequired().HasMaxLength(200);
            b.Property(r => r.MaxWeightTons).HasPrecision(18, 2);
            b.Property(r => r.EstimatedFineVnd).HasPrecision(18, 2);

            // Multi-tenancy Query Filter
            b.HasQueryFilter(r => !_currentTenantService.TenantId.HasValue || r.TenantId == _currentTenantService.TenantId.Value);
        });

        // AuditLog Configuration (Immutable)
        modelBuilder.Entity<AuditLog>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.EntityName).IsRequired().HasMaxLength(100);
            b.Property(a => a.Action).IsRequired().HasMaxLength(20);
            b.HasIndex(a => new { a.TenantId, a.ChangedAtUtc });

            // Multi-tenancy Query Filter
            b.HasQueryFilter(a => !_currentTenantService.TenantId.HasValue || a.TenantId == _currentTenantService.TenantId.Value);
        });
    }
}
