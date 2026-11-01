using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.PnL;
using VDBus.Domain.Enums;

namespace VDBus.Application.Services;

public class PnLService : IPnLService
{
    private readonly IApplicationDbContext _context;
    private const decimal StandardFuelPriceVnd = 24500m;
    private const decimal WagePerKm = 1500m;
    private const decimal BaseTripWage = 300000m;

    public PnLService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PnLSummaryDto> GetOverallPnLSummaryAsync(PnLReportFilterDto filter, CancellationToken ct = default)
    {
        // 1. Lấy danh sách chuyến xe trong kỳ báo cáo
        var tripsQuery = _context.Trips
            .Include(t => t.Orders)
            .Where(t => t.Status == TripStatus.Completed || t.Status == TripStatus.InProgress);

        if (filter.VehicleId.HasValue)
        {
            tripsQuery = tripsQuery.Where(t => t.VehicleId == filter.VehicleId.Value);
        }

        var trips = await tripsQuery.ToListAsync(ct);

        // Doanh thu cước vận tải
        decimal freightRevenue = trips.SelectMany(t => t.Orders).Sum(o => o.FreightAmountVnd);

        // Doanh thu neo xe kho bãi (Detention)
        var detentionQuery = _context.DetentionRecords
            .Where(d => d.CreatedAtUtc >= filter.FromUtc && d.CreatedAtUtc <= filter.ToUtc);

        if (filter.VehicleId.HasValue)
        {
            detentionQuery = detentionQuery.Where(d => d.VehicleId == filter.VehicleId.Value);
        }

        decimal detentionRevenue = await detentionQuery.SumAsync(d => d.DetentionFeeVnd, ct);
        decimal totalRevenue = freightRevenue + detentionRevenue;

        // 2. Chi phí nhiên liệu (từ FuelRecords hoặc định mức chuyến)
        var fuelRecordsQuery = _context.FuelRecords
            .Where(f => f.PurchasedAtUtc >= filter.FromUtc && f.PurchasedAtUtc <= filter.ToUtc);

        if (filter.VehicleId.HasValue)
        {
            fuelRecordsQuery = fuelRecordsQuery.Where(f => f.VehicleId == filter.VehicleId.Value);
        }

        decimal actualFuelCost = await fuelRecordsQuery.SumAsync(f => f.TotalAmountVnd, ct);
        decimal estimatedFuelCost = trips.Sum(t => t.EstimatedFuelLitre * StandardFuelPriceVnd);
        decimal fuelCost = actualFuelCost > 0 ? actualFuelCost : estimatedFuelCost;

        // 3. Chi phí cầu đường BOT (từ TollTransactions hoặc cước trạm chuyến)
        var tollQuery = _context.TollTransactions
            .Where(tt => tt.PassedAtUtc >= filter.FromUtc && tt.PassedAtUtc <= filter.ToUtc);

        if (filter.VehicleId.HasValue)
        {
            tollQuery = tollQuery.Where(tt => tt.VehicleId == filter.VehicleId.Value);
        }

        decimal actualTollCost = await tollQuery.SumAsync(tt => tt.AmountVnd, ct);
        decimal tripTollCost = trips.Sum(t => t.TotalTollAmountVnd);
        decimal tollCost = actualTollCost > 0 ? actualTollCost : tripTollCost;

        // 4. Chi phí lương tài xế (khoán theo km + công tác phí chuyến)
        decimal driverWageCost = trips.Sum(t => (t.TotalDistanceKm * WagePerKm) + BaseTripWage);

        // 5. Chi phí bảo dưỡng phương tiện
        var maintenanceQuery = _context.MaintenanceOrders
            .Where(m => m.ScheduledDateUtc >= filter.FromUtc && m.ScheduledDateUtc <= filter.ToUtc);

        if (filter.VehicleId.HasValue)
        {
            maintenanceQuery = maintenanceQuery.Where(m => m.VehicleId == filter.VehicleId.Value);
        }

        decimal maintenanceCost = await maintenanceQuery.SumAsync(m => m.TotalCostVnd, ct);

        decimal totalCost = fuelCost + tollCost + driverWageCost + maintenanceCost;
        decimal grossProfit = totalRevenue - totalCost;
        decimal marginPct = totalRevenue > 0 ? Math.Round((grossProfit / totalRevenue) * 100m, 2) : 0m;

        return new PnLSummaryDto
        {
            FromUtc = filter.FromUtc,
            ToUtc = filter.ToUtc,
            FreightRevenueVnd = freightRevenue,
            DetentionRevenueVnd = detentionRevenue,
            TotalRevenueVnd = totalRevenue,
            FuelCostVnd = fuelCost,
            TollCostVnd = tollCost,
            DriverWageCostVnd = driverWageCost,
            MaintenanceCostVnd = maintenanceCost,
            TotalCostVnd = totalCost,
            GrossProfitVnd = grossProfit,
            GrossMarginPercentage = marginPct,
            TotalTripsCompleted = trips.Count(t => t.Status == TripStatus.Completed),
            TotalDistanceKm = trips.Sum(t => t.TotalDistanceKm)
        };
    }

    public async Task<IReadOnlyList<VehiclePnLDto>> GetVehiclePnLBreakdownAsync(PnLReportFilterDto filter, CancellationToken ct = default)
    {
        var vehicles = await _context.Vehicles.ToListAsync(ct);
        var result = new List<VehiclePnLDto>();

        foreach (var v in vehicles)
        {
            var vehicleFilter = new PnLReportFilterDto
            {
                FromUtc = filter.FromUtc,
                ToUtc = filter.ToUtc,
                VehicleId = v.Id
            };

            var summary = await GetOverallPnLSummaryAsync(vehicleFilter, ct);

            result.Add(new VehiclePnLDto
            {
                VehicleId = v.Id,
                LicensePlate = v.LicensePlate,
                MakeModel = v.MakeModel,
                TripCount = summary.TotalTripsCompleted,
                TotalDistanceKm = summary.TotalDistanceKm,
                RevenueVnd = summary.TotalRevenueVnd,
                FuelCostVnd = summary.FuelCostVnd,
                TollCostVnd = summary.TollCostVnd,
                DriverWageVnd = summary.DriverWageCostVnd,
                MaintenanceCostVnd = summary.MaintenanceCostVnd,
                TotalCostVnd = summary.TotalCostVnd,
                NetProfitVnd = summary.GrossProfitVnd,
                MarginPercentage = summary.GrossMarginPercentage
            });
        }

        return result.OrderByDescending(r => r.RevenueVnd).ToList();
    }

    public async Task<IReadOnlyList<TripPnLDto>> GetTripPnLBreakdownAsync(PnLReportFilterDto filter, CancellationToken ct = default)
    {
        var trips = await _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .Include(t => t.Orders)
            .ToListAsync(ct);

        var result = new List<TripPnLDto>();

        foreach (var t in trips)
        {
            decimal revenue = t.Orders.Sum(o => o.FreightAmountVnd);
            decimal fuelCost = t.EstimatedFuelLitre * StandardFuelPriceVnd;
            decimal tollCost = t.TotalTollAmountVnd;
            decimal wageCost = (t.TotalDistanceKm * WagePerKm) + BaseTripWage;
            decimal totalCost = fuelCost + tollCost + wageCost;
            decimal profit = revenue - totalCost;
            decimal margin = revenue > 0 ? Math.Round((profit / revenue) * 100m, 2) : 0m;

            result.Add(new TripPnLDto
            {
                TripId = t.Id,
                TripCode = t.TripCode,
                VehiclePlate = t.Vehicle?.LicensePlate ?? string.Empty,
                DriverName = t.Driver?.FullName ?? string.Empty,
                DistanceKm = t.TotalDistanceKm,
                RevenueVnd = revenue,
                FuelCostVnd = fuelCost,
                TollCostVnd = tollCost,
                DriverWageVnd = wageCost,
                TotalCostVnd = totalCost,
                NetProfitVnd = profit,
                MarginPercentage = margin
            });
        }

        return result.OrderByDescending(t => t.RevenueVnd).ToList();
    }

    public async Task<IReadOnlyList<CustomerPnLDto>> GetCustomerPnLBreakdownAsync(PnLReportFilterDto filter, CancellationToken ct = default)
    {
        var customers = await _context.Customers
            .Include(c => c.Orders)
            .ToListAsync(ct);

        var result = new List<CustomerPnLDto>();

        foreach (var c in customers)
        {
            decimal freightRevenue = c.Orders.Sum(o => o.FreightAmountVnd);
            decimal detentionRevenue = await _context.DetentionRecords
                .Where(d => d.CustomerId == c.Id)
                .SumAsync(d => d.DetentionFeeVnd, ct);

            decimal totalRevenue = freightRevenue + detentionRevenue;
            // Ước tính chi phí trực tiếp phục vụ khách hàng này (tỷ lệ chuẩn 65% doanh thu vận tải)
            decimal estimatedCost = Math.Round(freightRevenue * 0.65m, 0);
            decimal profit = totalRevenue - estimatedCost;
            decimal margin = totalRevenue > 0 ? Math.Round((profit / totalRevenue) * 100m, 2) : 0m;

            result.Add(new CustomerPnLDto
            {
                CustomerId = c.Id,
                CustomerName = c.Name,
                CustomerCode = c.Code,
                TotalOrders = c.Orders.Count,
                FreightRevenueVnd = freightRevenue,
                DetentionRevenueVnd = detentionRevenue,
                TotalRevenueVnd = totalRevenue,
                EstimatedDirectCostVnd = estimatedCost,
                NetProfitVnd = profit,
                MarginPercentage = margin
            });
        }

        return result.OrderByDescending(c => c.TotalRevenueVnd).ToList();
    }

    public async Task<IReadOnlyList<RoutePnLDto>> GetRoutePnLBreakdownAsync(PnLReportFilterDto filter, CancellationToken ct = default)
    {
        var trips = await _context.Trips
            .Include(t => t.Stops)
            .Include(t => t.Orders)
            .ToListAsync(ct);

        // Gom nhóm các chuyến theo tuyến đường (Pickup -> Delivery)
        var routeGroups = trips
            .GroupBy(t =>
            {
                var pickup = t.Stops.FirstOrDefault(s => s.StopType == "Pickup")?.Address ?? "Kho Tổng";
                var delivery = t.Stops.FirstOrDefault(s => s.StopType == "Delivery")?.Address ?? "Điểm Giao";
                // Rút gọn địa danh chính (ví dụ: Đà Nẵng, Quảng Nam, Hà Nội)
                string from = pickup.Contains("Đà Nẵng") ? "Đà Nẵng" : pickup.Contains("Quảng Nam") ? "Quảng Nam" : "Khu vực 1";
                string to = delivery.Contains("Quảng Nam") ? "Quảng Nam" : delivery.Contains("Đà Nẵng") ? "Đà Nẵng" : "Khu vực 2";
                return $"{from} - {to}";
            });

        var result = new List<RoutePnLDto>();

        foreach (var g in routeGroups)
        {
            decimal revenue = g.SelectMany(t => t.Orders).Sum(o => o.FreightAmountVnd);
            decimal distance = g.Sum(t => t.TotalDistanceKm);
            decimal fuelCost = g.Sum(t => t.EstimatedFuelLitre * StandardFuelPriceVnd);
            decimal tollCost = g.Sum(t => t.TotalTollAmountVnd);
            decimal wageCost = g.Sum(t => (t.TotalDistanceKm * WagePerKm) + BaseTripWage);
            decimal totalCost = fuelCost + tollCost + wageCost;
            decimal profit = revenue - totalCost;
            decimal margin = revenue > 0 ? Math.Round((profit / revenue) * 100m, 2) : 0m;

            result.Add(new RoutePnLDto
            {
                RouteName = g.Key,
                TotalTrips = g.Count(),
                TotalDistanceKm = distance,
                RevenueVnd = revenue,
                TotalCostVnd = totalCost,
                NetProfitVnd = profit,
                MarginPercentage = margin
            });
        }

        return result.OrderByDescending(r => r.RevenueVnd).ToList();
    }
}
