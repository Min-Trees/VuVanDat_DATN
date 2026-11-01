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

    // Logistics Core Entities
    DbSet<Customer> Customers { get; }
    DbSet<Vehicle> Vehicles { get; }
    DbSet<Driver> Drivers { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<Trip> Trips { get; }
    DbSet<Stop> Stops { get; }
    DbSet<PodRecord> PodRecords { get; }
    DbSet<Invoice> Invoices { get; }

    // Phase 2 Telematics, Geofence, Tolls & Routing
    DbSet<Device> Devices { get; }
    DbSet<TelemetryRecord> TelemetryRecords { get; }
    DbSet<Geofence> Geofences { get; }
    DbSet<DetentionRecord> DetentionRecords { get; }
    DbSet<TollTransaction> TollTransactions { get; }
    DbSet<RouteStopPlan> RouteStopPlans { get; }
    DbSet<AxleLoadCalculation> AxleLoadCalculations { get; }

    // Phase 3 Financial, Maintenance, Fuel & Subscription
    DbSet<FuelRecord> FuelRecords { get; }
    DbSet<MaintenanceOrder> MaintenanceOrders { get; }
    DbSet<VehicleDocument> VehicleDocuments { get; }
    DbSet<SubscriptionPlan> SubscriptionPlans { get; }
    DbSet<TenantMeteringRecord> TenantMeteringRecords { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
