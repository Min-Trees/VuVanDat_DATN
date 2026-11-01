using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Metering;
using VDBus.Domain.Enums;

namespace VDBus.Application.Services;

public class MeteringService : IMeteringService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentTenantService _currentTenantService;

    public MeteringService(IApplicationDbContext context, ICurrentTenantService currentTenantService)
    {
        _context = context;
        _currentTenantService = currentTenantService;
    }

    public async Task<TenantUsageMeteringDto> GetTenantUsageMeteringAsync(Guid? tenantId = null, CancellationToken ct = default)
    {
        var resolvedTenantId = tenantId ?? _currentTenantService.TenantId ?? Guid.Parse("00000000-0000-0000-0000-000000000001");
        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == resolvedTenantId, ct);
        string tenantName = tenant?.Name ?? "VDBus Da Nang Logistics";

        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfDay = DateTime.UtcNow.Date;

        int activeVehicles = await _context.Vehicles.CountAsync(ct);
        int ordersThisMonth = await _context.Orders.Where(o => o.CreatedAtUtc >= startOfMonth).CountAsync(ct);
        long iotEventsToday = await _context.TelemetryRecords.Where(t => t.RecordedAtUtc >= startOfDay).LongCountAsync(ct);
        decimal storageMb = 3450.0m; // Dung lượng tài liệu và ảnh POD

        // Giới hạn định mức gói cước Pro (Mặc định)
        int maxVehicles = 25;
        int maxOrders = 1000;
        int maxIot = 50000;
        int maxStorage = 10240;

        decimal vehiclePct = Math.Round(((decimal)activeVehicles / maxVehicles) * 100m, 1);
        decimal orderPct = Math.Round(((decimal)ordersThisMonth / maxOrders) * 100m, 1);
        decimal iotPct = Math.Round(((decimal)iotEventsToday / maxIot) * 100m, 1);
        decimal storagePct = Math.Round((storageMb / maxStorage) * 100m, 1);

        bool isExceeded = activeVehicles > maxVehicles || ordersThisMonth > maxOrders || iotEventsToday > maxIot;
        string warning = string.Empty;

        if (activeVehicles > maxVehicles)
        {
            warning = $"Doanh nghiệp đã vượt số lượng xe cho phép ({activeVehicles}/{maxVehicles}). Cần nâng cấp gói Enterprise.";
        }
        else if (ordersThisMonth > maxOrders)
        {
            warning = $"Doanh nghiệp đã vượt số đơn hàng tháng này ({ordersThisMonth}/{maxOrders}).";
        }
        else if (vehiclePct >= 80m)
        {
            warning = $"Số lượng xe đã đạt {vehiclePct}% hạn mức gói dịch vụ.";
        }

        return new TenantUsageMeteringDto
        {
            TenantId = resolvedTenantId,
            TenantName = tenantName,
            PlanName = "Gói Doanh nghiệp Tiêu chuẩn (VDBus Pro)",
            PlanTier = SubscriptionTier.Pro,
            ActiveVehicles = activeVehicles,
            MaxVehicles = maxVehicles,
            VehicleUsagePercentage = vehiclePct,
            OrdersThisMonth = ordersThisMonth,
            MaxOrdersPerMonth = maxOrders,
            OrderUsagePercentage = orderPct,
            IoTEventsToday = iotEventsToday,
            MaxIoTEventsPerDay = maxIot,
            IoTUsagePercentage = iotPct,
            StorageUsedMb = storageMb,
            MaxStorageMb = maxStorage,
            StorageUsagePercentage = storagePct,
            IsQuotaExceeded = isExceeded,
            WarningMessage = warning
        };
    }

    public Task<IReadOnlyList<SubscriptionPlanDto>> GetSubscriptionPlansAsync(CancellationToken ct = default)
    {
        var plans = new List<SubscriptionPlanDto>
        {
            new()
            {
                Id = Guid.Parse("11111111-0000-0000-0000-000000000001"),
                Name = "VDBus Khởi nghiệp (Free)",
                Tier = SubscriptionTier.Free,
                MonthlyPriceVnd = 0,
                MaxVehicles = 3,
                MaxOrdersPerMonth = 50,
                MaxIoTEventsPerDay = 5000,
                MaxStorageMb = 1024,
                FeatureSummary = "Quản lý 3 xe, điều phối cơ bản, ứng dụng tài xế, tra cứu chủ hàng"
            },
            new()
            {
                Id = Guid.Parse("22222222-0000-0000-0000-000000000002"),
                Name = "VDBus Tiêu chuẩn (Pro)",
                Tier = SubscriptionTier.Pro,
                MonthlyPriceVnd = 2500000,
                MaxVehicles = 25,
                MaxOrdersPerMonth = 1000,
                MaxIoTEventsPerDay = 50000,
                MaxStorageMb = 10240,
                FeatureSummary = "Realtime Telematics, Chuỗi lạnh, TPMS, HOS, Neo xe kho bãi, Tải trọng trục"
            },
            new()
            {
                Id = Guid.Parse("33333333-0000-0000-0000-000000000003"),
                Name = "VDBus Doanh nghiệp Lớn (Enterprise)",
                Tier = SubscriptionTier.Enterprise,
                MonthlyPriceVnd = 8000000,
                MaxVehicles = 100,
                MaxOrdersPerMonth = 10000,
                MaxIoTEventsPerDay = 500000,
                MaxStorageMb = 102400,
                FeatureSummary = "Không giới hạn kết nối thiết bị, AI Copilot phân tích, Báo cáo P&L đa chiều, Hóa đơn VAT điện tử"
            }
        };

        return Task.FromResult<IReadOnlyList<SubscriptionPlanDto>>(plans);
    }

    public async Task<bool> CanCreateVehicleAsync(Guid? tenantId = null, CancellationToken ct = default)
    {
        var metering = await GetTenantUsageMeteringAsync(tenantId, ct);
        return metering.ActiveVehicles < metering.MaxVehicles;
    }

    public async Task<bool> CanCreateOrderAsync(Guid? tenantId = null, CancellationToken ct = default)
    {
        var metering = await GetTenantUsageMeteringAsync(tenantId, ct);
        return metering.OrdersThisMonth < metering.MaxOrdersPerMonth;
    }
}
