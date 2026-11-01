using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Fuel;
using VDBus.Domain.Entities;

namespace VDBus.Application.Services;

public class FuelService : IFuelService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentTenantService _currentTenantService;

    public FuelService(IApplicationDbContext context, ICurrentTenantService currentTenantService)
    {
        _context = context;
        _currentTenantService = currentTenantService;
    }

    public async Task<FuelRecordDto> CreateFuelRecordAsync(CreateFuelRecordRequestDto request, CancellationToken ct = default)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == request.VehicleId, ct);
        if (vehicle == null)
        {
            throw new KeyNotFoundException($"Khong tim thay phuong tien voi ID: {request.VehicleId}");
        }

        var tenantId = _currentTenantService.TenantId ?? vehicle.TenantId;
        var totalAmount = Math.Round(request.FuelLitre * request.UnitPriceVnd, 0);

        // 1. Phân tích đối chiếu cảm biến mức dầu thực tế (nếu có)
        double abnormalityScore = 0.0;
        string abnormalityReason = "Tieu hao va bom dau trong nguong binh thuong.";
        double confidenceRating = 0.90;

        if (request.SensorLitreBeforeRefuel.HasValue && request.SensorLitreAfterRefuel.HasValue)
        {
            confidenceRating = 0.96;
            decimal sensorDelta = request.SensorLitreAfterRefuel.Value - request.SensorLitreBeforeRefuel.Value;
            if (sensorDelta > 0)
            {
                decimal varianceLitres = Math.Abs(request.FuelLitre - sensorDelta);
                decimal variancePct = (varianceLitres / request.FuelLitre) * 100m;

                if (variancePct > 15m)
                {
                    abnormalityScore = Math.Min(1.0, 0.40 + (double)(variancePct - 15m) * 0.02);
                    abnormalityReason = $"Luong dau hoa don ({request.FuelLitre:F1}L) chenh lech dang ke so voi cam bien thung ({sensorDelta:F1}L, lech {variancePct:F1}%).";
                }
            }
        }

        // 2. Đối chiếu quãng đường và mức tiêu hao so với lần đổ dầu trước
        var lastRecord = await _context.FuelRecords
            .Where(f => f.VehicleId == request.VehicleId)
            .OrderByDescending(f => f.OdometerKm)
            .FirstOrDefaultAsync(ct);

        if (lastRecord != null && request.OdometerKm > lastRecord.OdometerKm)
        {
            decimal deltaKm = request.OdometerKm - lastRecord.OdometerKm;
            if (deltaKm > 20m) // Ít nhất 20km di chuyển
            {
                decimal actualRatePer100Km = (request.FuelLitre / deltaKm) * 100m;
                decimal standardRate = vehicle.FuelConsumptionLitrePer100Km > 0 ? (decimal)vehicle.FuelConsumptionLitrePer100Km : 20.0m;
                decimal rateVariancePct = ((actualRatePer100Km - standardRate) / standardRate) * 100m;

                if (rateVariancePct > 25m)
                {
                    double rateScore = Math.Min(1.0, 0.50 + (double)(rateVariancePct - 25m) * 0.015);
                    if (rateScore > abnormalityScore)
                    {
                        abnormalityScore = rateScore;
                        abnormalityReason = $"Muc tieu hao ({actualRatePer100Km:F1}L/100km) vuot qua dinh muc ({standardRate:F1}L/100km) {rateVariancePct:F1}%. Can kiem tra tai trong va ro ri.";
                    }
                }
            }
        }

        var record = new FuelRecord
        {
            TenantId = tenantId,
            VehicleId = request.VehicleId,
            DriverId = request.DriverId,
            TripId = request.TripId,
            OdometerKm = request.OdometerKm,
            FuelLitre = request.FuelLitre,
            UnitPriceVnd = request.UnitPriceVnd,
            TotalAmountVnd = totalAmount,
            StationName = request.StationName,
            SensorLitreBeforeRefuel = request.SensorLitreBeforeRefuel,
            SensorLitreAfterRefuel = request.SensorLitreAfterRefuel,
            AbnormalityScore = Math.Round(abnormalityScore, 2),
            AbnormalityReason = abnormalityReason,
            ConfidenceRating = confidenceRating,
            PurchasedAtUtc = request.PurchasedAtUtc ?? DateTime.UtcNow,
            ReceiptPhotoUrl = request.ReceiptPhotoUrl,
            Notes = request.Notes,
            IsSimulated = true
        };

        _context.FuelRecords.Add(record);
        await _context.SaveChangesAsync(ct);

        return new FuelRecordDto
        {
            Id = record.Id,
            VehicleId = record.VehicleId,
            VehiclePlate = vehicle.LicensePlate,
            DriverId = record.DriverId,
            TripId = record.TripId,
            OdometerKm = record.OdometerKm,
            FuelLitre = record.FuelLitre,
            UnitPriceVnd = record.UnitPriceVnd,
            TotalAmountVnd = record.TotalAmountVnd,
            StationName = record.StationName,
            SensorLitreBeforeRefuel = record.SensorLitreBeforeRefuel,
            SensorLitreAfterRefuel = record.SensorLitreAfterRefuel,
            AbnormalityScore = record.AbnormalityScore,
            AbnormalityReason = record.AbnormalityReason,
            ConfidenceRating = record.ConfidenceRating,
            PurchasedAtUtc = record.PurchasedAtUtc,
            IsSimulated = record.IsSimulated
        };
    }

    public async Task<IReadOnlyList<FuelRecordDto>> GetVehicleFuelRecordsAsync(Guid vehicleId, DateTime? fromUtc = null, DateTime? toUtc = null, CancellationToken ct = default)
    {
        var query = _context.FuelRecords
            .Include(f => f.Vehicle)
            .Include(f => f.Driver)
            .Where(f => f.VehicleId == vehicleId);

        if (fromUtc.HasValue)
        {
            query = query.Where(f => f.PurchasedAtUtc >= fromUtc.Value);
        }

        if (toUtc.HasValue)
        {
            query = query.Where(f => f.PurchasedAtUtc <= toUtc.Value);
        }

        var list = await query
            .OrderByDescending(f => f.PurchasedAtUtc)
            .ToListAsync(ct);

        return list.Select(f => new FuelRecordDto
        {
            Id = f.Id,
            VehicleId = f.VehicleId,
            VehiclePlate = f.Vehicle?.LicensePlate ?? string.Empty,
            DriverId = f.DriverId,
            DriverName = f.Driver?.FullName ?? string.Empty,
            TripId = f.TripId,
            OdometerKm = f.OdometerKm,
            FuelLitre = f.FuelLitre,
            UnitPriceVnd = f.UnitPriceVnd,
            TotalAmountVnd = f.TotalAmountVnd,
            StationName = f.StationName,
            SensorLitreBeforeRefuel = f.SensorLitreBeforeRefuel,
            SensorLitreAfterRefuel = f.SensorLitreAfterRefuel,
            AbnormalityScore = f.AbnormalityScore,
            AbnormalityReason = f.AbnormalityReason,
            ConfidenceRating = f.ConfidenceRating,
            PurchasedAtUtc = f.PurchasedAtUtc,
            IsSimulated = f.IsSimulated
        }).ToList();
    }

    public async Task<FuelConsumptionSummaryDto> GetVehicleConsumptionSummaryAsync(Guid vehicleId, DateTime fromUtc, DateTime toUtc, CancellationToken ct = default)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == vehicleId, ct);
        if (vehicle == null)
        {
            throw new KeyNotFoundException($"Khong tim thay phuong tien voi ID: {vehicleId}");
        }

        var records = await _context.FuelRecords
            .Where(f => f.VehicleId == vehicleId && f.PurchasedAtUtc >= fromUtc && f.PurchasedAtUtc <= toUtc)
            .OrderBy(f => f.OdometerKm)
            .ToListAsync(ct);

        decimal standardRate = vehicle.FuelConsumptionLitrePer100Km > 0 ? (decimal)vehicle.FuelConsumptionLitrePer100Km : 20.0m;
        decimal totalFuelLitre = records.Sum(r => r.FuelLitre);
        decimal totalFuelCost = records.Sum(r => r.TotalAmountVnd);
        int abnormalCount = records.Count(r => r.AbnormalityScore >= 0.50);

        decimal totalDistanceKm = 0m;
        decimal actualRatePer100Km = standardRate;
        decimal variancePct = 0m;

        if (records.Count >= 2)
        {
            var firstOdo = records.First().OdometerKm;
            var lastOdo = records.Last().OdometerKm;
            totalDistanceKm = Math.Max(0m, lastOdo - firstOdo);

            if (totalDistanceKm > 0m)
            {
                actualRatePer100Km = Math.Round((totalFuelLitre / totalDistanceKm) * 100m, 2);
                variancePct = Math.Round(((actualRatePer100Km - standardRate) / standardRate) * 100m, 2);
            }
        }

        string evaluationStatus = "Normal";
        string evaluationSummary = "Muc tieu hao nhien lieu trong gioi han on dinh.";

        if (variancePct > 20m || abnormalCount >= 2)
        {
            evaluationStatus = "HighVariance";
            evaluationSummary = $"Muc tieu hao cao hon dinh muc {variancePct:F1}% kem {abnormalCount} su kien bat thuong. Can kiem tra ky thuat xe.";
        }
        else if (variancePct > 10m || abnormalCount == 1)
        {
            evaluationStatus = "Warning";
            evaluationSummary = $"Muc tieu hao tang nhe {variancePct:F1}%. Nen theo doi trong chu ky tiep theo.";
        }

        return new FuelConsumptionSummaryDto
        {
            VehicleId = vehicle.Id,
            LicensePlate = vehicle.LicensePlate,
            MakeModel = vehicle.MakeModel,
            StandardConsumptionLitrePer100Km = standardRate,
            ActualConsumptionLitrePer100Km = actualRatePer100Km,
            TotalFuelLitre = totalFuelLitre,
            TotalDistanceKm = totalDistanceKm,
            TotalFuelCostVnd = totalFuelCost,
            VariancePercentage = variancePct,
            AbnormalEventsCount = abnormalCount,
            EvaluationStatus = evaluationStatus,
            EvaluationSummary = evaluationSummary
        };
    }
}
