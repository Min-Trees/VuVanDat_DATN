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

    // Logistics Core Entities
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<Stop> Stops => Set<Stop>();
    public DbSet<PodRecord> PodRecords => Set<PodRecord>();
    public DbSet<Invoice> Invoices => Set<Invoice>();

    // Phase 2 Entities
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<TelemetryRecord> TelemetryRecords => Set<TelemetryRecord>();
    public DbSet<Geofence> Geofences => Set<Geofence>();
    public DbSet<DetentionRecord> DetentionRecords => Set<DetentionRecord>();
    public DbSet<TollTransaction> TollTransactions => Set<TollTransaction>();
    public DbSet<RouteStopPlan> RouteStopPlans => Set<RouteStopPlan>();
    public DbSet<AxleLoadCalculation> AxleLoadCalculations => Set<AxleLoadCalculation>();

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
            b.HasQueryFilter(r => !_currentTenantService.TenantId.HasValue || r.TenantId == _currentTenantService.TenantId.Value);
        });

        // AuditLog Configuration (Immutable)
        modelBuilder.Entity<AuditLog>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.EntityName).IsRequired().HasMaxLength(100);
            b.Property(a => a.Action).IsRequired().HasMaxLength(20);
            b.HasIndex(a => new { a.TenantId, a.ChangedAtUtc });
            b.HasQueryFilter(a => !_currentTenantService.TenantId.HasValue || a.TenantId == _currentTenantService.TenantId.Value);
        });

        // Customer Configuration
        modelBuilder.Entity<Customer>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).IsRequired().HasMaxLength(200);
            b.Property(c => c.Code).IsRequired().HasMaxLength(50);
            b.Property(c => c.CreditLimitVnd).HasPrecision(18, 2);
            b.HasIndex(c => new { c.TenantId, c.Code }).IsUnique();
            b.HasQueryFilter(c => !_currentTenantService.TenantId.HasValue || c.TenantId == _currentTenantService.TenantId.Value);
        });

        // Vehicle Configuration
        modelBuilder.Entity<Vehicle>(b =>
        {
            b.HasKey(v => v.Id);
            b.Property(v => v.LicensePlate).IsRequired().HasMaxLength(20);
            b.Property(v => v.MakeModel).HasMaxLength(100);
            b.Property(v => v.MaxPayloadKg).HasPrecision(18, 2);
            b.Property(v => v.CargoVolumeCbm).HasPrecision(18, 2);
            b.Property(v => v.FuelConsumptionLitrePer100Km).HasPrecision(18, 2);
            b.HasIndex(v => new { v.TenantId, v.LicensePlate }).IsUnique();
            b.HasQueryFilter(v => !_currentTenantService.TenantId.HasValue || v.TenantId == _currentTenantService.TenantId.Value);
        });

        // Driver Configuration
        modelBuilder.Entity<Driver>(b =>
        {
            b.HasKey(d => d.Id);
            b.Property(d => d.FullName).IsRequired().HasMaxLength(150);
            b.Property(d => d.PhoneNumber).IsRequired().HasMaxLength(20);
            b.Property(d => d.LicenseNumber).IsRequired().HasMaxLength(50);
            b.HasIndex(d => new { d.TenantId, d.PhoneNumber });
            b.HasQueryFilter(d => !_currentTenantService.TenantId.HasValue || d.TenantId == _currentTenantService.TenantId.Value);
        });

        // Order Configuration
        modelBuilder.Entity<Order>(b =>
        {
            b.HasKey(o => o.Id);
            b.Property(o => o.OrderCode).IsRequired().HasMaxLength(50);
            b.Property(o => o.PickupAddress).IsRequired().HasMaxLength(300);
            b.Property(o => o.DeliveryAddress).IsRequired().HasMaxLength(300);
            b.Property(o => o.TotalWeightKg).HasPrecision(18, 2);
            b.Property(o => o.TotalVolumeCbm).HasPrecision(18, 2);
            b.Property(o => o.FreightAmountVnd).HasPrecision(18, 2);
            b.Property(o => o.TrackingToken).IsRequired().HasMaxLength(100);
            b.HasIndex(o => new { o.TenantId, o.OrderCode }).IsUnique();
            b.HasIndex(o => o.TrackingToken).IsUnique();
            b.HasQueryFilter(o => !_currentTenantService.TenantId.HasValue || o.TenantId == _currentTenantService.TenantId.Value);

            b.HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(o => o.Trip)
                .WithMany(t => t.Orders)
                .HasForeignKey(o => o.TripId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // OrderItem Configuration
        modelBuilder.Entity<OrderItem>(b =>
        {
            b.HasKey(i => i.Id);
            b.Property(i => i.ItemName).IsRequired().HasMaxLength(150);
            b.Property(i => i.Quantity).HasPrecision(18, 2);
            b.Property(i => i.WeightKg).HasPrecision(18, 2);
            b.Property(i => i.VolumeCbm).HasPrecision(18, 2);
            b.HasQueryFilter(i => !_currentTenantService.TenantId.HasValue || i.TenantId == _currentTenantService.TenantId.Value);

            b.HasOne(i => i.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Trip Configuration
        modelBuilder.Entity<Trip>(b =>
        {
            b.HasKey(t => t.Id);
            b.Property(t => t.TripCode).IsRequired().HasMaxLength(50);
            b.Property(t => t.TotalDistanceKm).HasPrecision(18, 2);
            b.Property(t => t.EstimatedFuelLitre).HasPrecision(18, 2);
            b.Property(t => t.TotalTollAmountVnd).HasPrecision(18, 2);
            b.HasIndex(t => new { t.TenantId, t.TripCode }).IsUnique();
            b.HasQueryFilter(t => !_currentTenantService.TenantId.HasValue || t.TenantId == _currentTenantService.TenantId.Value);

            b.HasOne(t => t.Vehicle)
                .WithMany(v => v.Trips)
                .HasForeignKey(t => t.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(t => t.Driver)
                .WithMany(d => d.Trips)
                .HasForeignKey(t => t.DriverId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Stop Configuration
        modelBuilder.Entity<Stop>(b =>
        {
            b.HasKey(s => s.Id);
            b.Property(s => s.Address).IsRequired().HasMaxLength(300);
            b.HasQueryFilter(s => !_currentTenantService.TenantId.HasValue || s.TenantId == _currentTenantService.TenantId.Value);

            b.HasOne(s => s.Trip)
                .WithMany(t => t.Stops)
                .HasForeignKey(s => s.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PodRecord Configuration
        modelBuilder.Entity<PodRecord>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.RecipientName).IsRequired().HasMaxLength(150);
            b.Property(p => p.HashSha256).IsRequired().HasMaxLength(100);
            b.HasIndex(p => new { p.TenantId, p.OrderId }).IsUnique();
            b.HasQueryFilter(p => !_currentTenantService.TenantId.HasValue || p.TenantId == _currentTenantService.TenantId.Value);

            b.HasOne(p => p.Order)
                .WithOne(o => o.PodRecord)
                .HasForeignKey<PodRecord>(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Invoice Configuration
        modelBuilder.Entity<Invoice>(b =>
        {
            b.HasKey(inv => inv.Id);
            b.Property(inv => inv.InvoiceCode).IsRequired().HasMaxLength(50);
            b.Property(inv => inv.SubtotalVnd).HasPrecision(18, 2);
            b.Property(inv => inv.TaxPercent).HasPrecision(18, 2);
            b.Property(inv => inv.TaxAmountVnd).HasPrecision(18, 2);
            b.Property(inv => inv.TotalAmountVnd).HasPrecision(18, 2);
            b.HasIndex(inv => new { inv.TenantId, inv.InvoiceCode }).IsUnique();
            b.HasQueryFilter(inv => !_currentTenantService.TenantId.HasValue || inv.TenantId == _currentTenantService.TenantId.Value);

            b.HasOne(inv => inv.Customer)
                .WithMany(c => c.Invoices)
                .HasForeignKey(inv => inv.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Phase 2 Entity Configurations with Tenant Isolation
        modelBuilder.Entity<Device>(b =>
        {
            b.HasKey(d => d.Id);
            b.Property(d => d.SerialNumber).IsRequired().HasMaxLength(100);
            b.HasIndex(d => new { d.TenantId, d.SerialNumber }).IsUnique();
            b.HasQueryFilter(d => !_currentTenantService.TenantId.HasValue || d.TenantId == _currentTenantService.TenantId.Value);
        });

        modelBuilder.Entity<TelemetryRecord>(b =>
        {
            b.HasKey(t => t.Id);
            b.HasIndex(t => new { t.TenantId, t.VehicleId, t.RecordedAtUtc });
            b.HasQueryFilter(t => !_currentTenantService.TenantId.HasValue || t.TenantId == _currentTenantService.TenantId.Value);
        });

        modelBuilder.Entity<Geofence>(b =>
        {
            b.HasKey(g => g.Id);
            b.Property(g => g.Name).IsRequired().HasMaxLength(200);
            b.Property(g => g.DetentionRatePerHourVnd).HasPrecision(18, 2);
            b.HasIndex(g => new { g.TenantId, g.Name });
            b.HasQueryFilter(g => !_currentTenantService.TenantId.HasValue || g.TenantId == _currentTenantService.TenantId.Value);
        });

        modelBuilder.Entity<DetentionRecord>(b =>
        {
            b.HasKey(dr => dr.Id);
            b.Property(dr => dr.DetentionFeeVnd).HasPrecision(18, 2);
            b.HasIndex(dr => new { dr.TenantId, dr.GeofenceId, dr.VehicleId });
            b.HasQueryFilter(dr => !_currentTenantService.TenantId.HasValue || dr.TenantId == _currentTenantService.TenantId.Value);
        });

        modelBuilder.Entity<TollTransaction>(b =>
        {
            b.HasKey(tt => tt.Id);
            b.Property(tt => tt.TransactionCode).IsRequired().HasMaxLength(100);
            b.Property(tt => tt.StationName).IsRequired().HasMaxLength(200);
            b.Property(tt => tt.AmountVnd).HasPrecision(18, 2);
            b.HasIndex(tt => new { tt.TenantId, tt.TransactionCode }).IsUnique();
            b.HasQueryFilter(tt => !_currentTenantService.TenantId.HasValue || tt.TenantId == _currentTenantService.TenantId.Value);
        });

        modelBuilder.Entity<RouteStopPlan>(b =>
        {
            b.HasKey(rsp => rsp.Id);
            b.Property(rsp => rsp.DistanceKmFromPrevious).HasPrecision(18, 2);
            b.Property(rsp => rsp.EstimatedFuelLitre).HasPrecision(18, 2);
            b.HasIndex(rsp => new { rsp.TenantId, rsp.TripId, rsp.SequenceOrder });
            b.HasQueryFilter(rsp => !_currentTenantService.TenantId.HasValue || rsp.TenantId == _currentTenantService.TenantId.Value);
        });

        modelBuilder.Entity<AxleLoadCalculation>(b =>
        {
            b.HasKey(alc => alc.Id);
            b.Property(alc => alc.TotalCargoWeightKg).HasPrecision(18, 2);
            b.Property(alc => alc.FrontAxleLoadKg).HasPrecision(18, 2);
            b.Property(alc => alc.RearAxleLoadKg).HasPrecision(18, 2);
            b.Property(alc => alc.FrontAxleLimitKg).HasPrecision(18, 2);
            b.Property(alc => alc.RearAxleLimitKg).HasPrecision(18, 2);
            b.Property(alc => alc.MarginOfErrorPercentage).HasPrecision(5, 2);
            b.HasIndex(alc => new { alc.TenantId, alc.VehicleId });
            b.HasQueryFilter(alc => !_currentTenantService.TenantId.HasValue || alc.TenantId == _currentTenantService.TenantId.Value);
        });
    }
}
