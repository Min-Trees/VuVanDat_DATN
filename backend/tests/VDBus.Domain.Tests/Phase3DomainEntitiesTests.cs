using System;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using Xunit;

namespace VDBus.Domain.Tests;

public class Phase3DomainEntitiesTests
{
    [Fact]
    public void FuelRecord_Instantiation_SetsPropertiesCorrectly()
    {
        var tenantId = Guid.NewGuid();
        var vehicleId = Guid.NewGuid();
        var driverId = Guid.NewGuid();
        var tripId = Guid.NewGuid();

        var record = new FuelRecord
        {
            TenantId = tenantId,
            VehicleId = vehicleId,
            DriverId = driverId,
            TripId = tripId,
            OdometerKm = 45200.5m,
            FuelLitre = 180.0m,
            UnitPriceVnd = 24500m,
            TotalAmountVnd = 4410000m,
            StationName = "Petrolimex Cửa hàng 15 - Đà Nẵng",
            SensorLitreBeforeRefuel = 45.0m,
            SensorLitreAfterRefuel = 224.5m,
            AbnormalityScore = 0.05,
            AbnormalityReason = "Độ sai lệch trong biên độ cho phép (0.28%)",
            ConfidenceRating = 0.98,
            IsSimulated = true
        };

        Assert.Equal(tenantId, record.TenantId);
        Assert.Equal(vehicleId, record.VehicleId);
        Assert.Equal(4410000m, record.TotalAmountVnd);
        Assert.True(record.IsSimulated);
        Assert.Equal(0.98, record.ConfidenceRating);
    }

    [Fact]
    public void MaintenanceOrder_Instantiation_SetsPropertiesCorrectly()
    {
        var tenantId = Guid.NewGuid();
        var vehicleId = Guid.NewGuid();

        var order = new MaintenanceOrder
        {
            TenantId = tenantId,
            VehicleId = vehicleId,
            OrderCode = "BD-2026-0042",
            MaintenanceType = MaintenanceType.PeriodicCheck,
            OdometerKm = 50000.0m,
            TotalCostVnd = 6500000m,
            GarageName = "Trung tâm Dịch vụ Ủy quyền Hino Đà Nẵng",
            Description = "Bảo dưỡng cấp 5 vạn km: thay nhớt động cơ, lọc dầu, cân chỉnh phanh",
            PartsReplaced = "Lọc nhớt, Nhớt động cơ 15W40, Má phanh trước",
            Status = "Completed"
        };

        Assert.Equal("BD-2026-0042", order.OrderCode);
        Assert.Equal(MaintenanceType.PeriodicCheck, order.MaintenanceType);
        Assert.Equal(6500000m, order.TotalCostVnd);
        Assert.Equal("Completed", order.Status);
    }

    [Fact]
    public void VehicleDocument_Instantiation_CalculatesAlertThreshold()
    {
        var tenantId = Guid.NewGuid();
        var vehicleId = Guid.NewGuid();
        var expiry = DateTime.UtcNow.AddDays(15);

        var doc = new VehicleDocument
        {
            TenantId = tenantId,
            VehicleId = vehicleId,
            DocumentType = DocumentType.InspectionCertificate,
            DocumentNumber = "KD-43C-18924-2026",
            Issuer = "Trung tâm Đăng kiểm 43-01S",
            IssuedDateUtc = DateTime.UtcNow.AddMonths(-11),
            ExpiryDateUtc = expiry,
            AlertBeforeDays = 30,
            IsAlertActive = true
        };

        Assert.Equal(DocumentType.InspectionCertificate, doc.DocumentType);
        Assert.True(doc.IsAlertActive);
        Assert.True(doc.ExpiryDateUtc > DateTime.UtcNow);
    }

    [Fact]
    public void SubscriptionPlan_And_MeteringRecord_PropertiesMatch()
    {
        var plan = new SubscriptionPlan
        {
            Name = "VDBus Enterprise Fleet",
            Tier = SubscriptionTier.Enterprise,
            MonthlyPriceVnd = 15000000m,
            MaxVehicles = 100,
            MaxOrdersPerMonth = 10000,
            MaxIoTEventsPerDay = 500000,
            MaxStorageMb = 102400
        };

        var tenantId = Guid.NewGuid();
        var metering = new TenantMeteringRecord
        {
            TenantId = tenantId,
            ActiveVehicleCount = 45,
            OrdersThisMonth = 3200,
            IoTEventsToday = 142000,
            StorageUsedMb = 24500.5m,
            IsVehicleQuotaExceeded = false,
            IsOrderQuotaExceeded = false
        };

        Assert.Equal(SubscriptionTier.Enterprise, plan.Tier);
        Assert.Equal(100, plan.MaxVehicles);
        Assert.False(metering.IsVehicleQuotaExceeded);
        Assert.Equal(45, metering.ActiveVehicleCount);
    }
}
