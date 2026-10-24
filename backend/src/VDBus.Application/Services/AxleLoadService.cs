using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.AxleLoad;
using VDBus.Domain.Entities;

namespace VDBus.Application.Services;

public class AxleLoadService : IAxleLoadService
{
    private readonly IApplicationDbContext _context;

    public AxleLoadService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AxleLoadResultDto> CalculateAxleLoadAsync(AxleLoadCalculationRequestDto request, CancellationToken ct = default)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == request.VehicleId, ct);
        if (vehicle == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy phương tiện có mã ID: {request.VehicleId}");
        }

        // Thông số cấu hình hình học xe
        int wheelbaseMm = vehicle.AxleCount >= 4 ? 7200 : vehicle.AxleCount == 3 ? 6200 : 5500;
        int distanceFrontAxleToBodyMm = 1200;
        int bodyLengthMm = vehicle.LengthMm > 0 ? vehicle.LengthMm : 7400;

        // Trọng lượng bản thân xe rỗng và giới hạn trục
        decimal emptyFrontKg;
        decimal emptyRearKg;
        decimal frontLimitKg;
        decimal rearLimitKg;

        if (vehicle.AxleCount >= 4)
        {
            emptyFrontKg = 6000m;
            emptyRearKg = 8000m;
            frontLimitKg = 11000m; // Cụm 2 trục dẫn hướng
            rearLimitKg = 24000m;  // Cụm 3 trục sau
        }
        else if (vehicle.AxleCount == 3)
        {
            emptyFrontKg = 4500m;
            emptyRearKg = 5500m;
            frontLimitKg = 6500m;
            rearLimitKg = 18000m; // Cụm trục đôi sau
        }
        else
        {
            emptyFrontKg = 3200m;
            emptyRearKg = 2800m;
            frontLimitKg = 6000m; // Trục đơn trước
            rearLimitKg = 10000m; // Trục đơn sau
        }

        // Tính toán tổng trọng lượng và vị trí trọng tâm (CoG) của hàng hóa
        decimal totalCargoWeightKg = 0m;
        int cogMmFromFront = 0;

        if (request.Pallets.Count > 0)
        {
            totalCargoWeightKg = request.Pallets.Sum(p => p.WeightKg);
            if (totalCargoWeightKg > 0)
            {
                decimal weightedPositionSum = request.Pallets.Sum(p => p.WeightKg * (p.PositionMmFromFront + (p.LengthMm / 2)));
                cogMmFromFront = (int)(weightedPositionSum / totalCargoWeightKg);
            }
        }
        else if (request.TotalCargoWeightKg.HasValue)
        {
            totalCargoWeightKg = request.TotalCargoWeightKg.Value;
            cogMmFromFront = request.CustomCenterOfGravityMm ?? (bodyLengthMm / 2);
        }

        // Tính mô-men tĩnh học quanh trục trước
        // F_cargo_rear * Wheelbase = CargoWeight * (D_front + CoG)
        decimal armFromFrontAxleMm = distanceFrontAxleToBodyMm + cogMmFromFront;
        decimal cargoRearLoadKg = (totalCargoWeightKg * armFromFrontAxleMm) / wheelbaseMm;
        decimal cargoFrontLoadKg = totalCargoWeightKg - cargoRearLoadKg;

        decimal totalFrontLoadKg = Math.Round(emptyFrontKg + cargoFrontLoadKg, 0);
        decimal totalRearLoadKg = Math.Round(emptyRearKg + cargoRearLoadKg, 0);
        decimal totalGrossKg = totalFrontLoadKg + totalRearLoadKg;

        bool isFrontOverloaded = totalFrontLoadKg > frontLimitKg;
        bool isRearOverloaded = totalRearLoadKg > rearLimitKg;

        string status;
        string recommendation;

        if (isFrontOverloaded && isRearOverloaded)
        {
            status = "GrossOverloaded";
            recommendation = "Tổng tải trọng vượt quá khả năng chịu tải của cả hai trục xe. Cần hạ tải bớt hàng hóa.";
        }
        else if (isRearOverloaded)
        {
            status = "RearOverloaded";
            int shiftMm = Math.Min(1500, Math.Max(300, (int)((totalRearLoadKg - rearLimitKg) * wheelbaseMm / (totalCargoWeightKg > 0 ? totalCargoWeightKg : 1))));
            recommendation = $"CẢNH BÁO QUÁ TẢI TRỤC SAU: Khuyến nghị dời các kiện hàng nặng về phía trước khoảng {(shiftMm / 1000.0):F1} mét để san bớt tải sang trục trước.";
        }
        else if (isFrontOverloaded)
        {
            status = "FrontOverloaded";
            int shiftMm = Math.Min(1500, Math.Max(300, (int)((totalFrontLoadKg - frontLimitKg) * wheelbaseMm / (totalCargoWeightKg > 0 ? totalCargoWeightKg : 1))));
            recommendation = $"CẢNH BÁO QUÁ TẢI TRỤC TRƯỚC: Khuyến nghị dời các kiện hàng nặng lùi về phía sau khoảng {(shiftMm / 1000.0):F1} mét để giảm tải cho trục dẫn hướng.";
        }
        else
        {
            status = "Safe";
            recommendation = "Tải trọng phân bổ cân bằng và đạt ngưỡng cấu hình an toàn trên tất cả các trục.";
        }

        var result = new AxleLoadResultDto
        {
            VehicleId = vehicle.Id,
            LicensePlate = vehicle.LicensePlate,
            AxleCount = vehicle.AxleCount,
            TotalGrossWeightKg = totalGrossKg,
            TotalCargoWeightKg = totalCargoWeightKg,
            CenterOfGravityMmFromFront = cogMmFromFront,
            FrontAxleLoadKg = totalFrontLoadKg,
            FrontAxleLimitKg = frontLimitKg,
            FrontAxleUtilizationPct = Math.Round((totalFrontLoadKg / frontLimitKg) * 100, 1),
            IsFrontOverloaded = isFrontOverloaded,
            RearAxleLoadKg = totalRearLoadKg,
            RearAxleLimitKg = rearLimitKg,
            RearAxleUtilizationPct = Math.Round((totalRearLoadKg / rearLimitKg) * 100, 1),
            IsRearOverloaded = isRearOverloaded,
            MarginOfErrorPercentage = 3.0m,
            Status = status,
            Recommendation = recommendation,
            FormulaSummary = $"F_rear = ({totalCargoWeightKg} * {armFromFrontAxleMm} / {wheelbaseMm}) + {emptyRearKg}"
        };

        // Lưu bản ghi tính toán vào database
        var entity = new AxleLoadCalculation
        {
            TenantId = vehicle.TenantId,
            VehicleId = vehicle.Id,
            OrderId = request.OrderId,
            TotalCargoWeightKg = totalCargoWeightKg,
            CenterOfGravityMmFromFront = cogMmFromFront,
            FrontAxleLoadKg = totalFrontLoadKg,
            RearAxleLoadKg = totalRearLoadKg,
            FrontAxleLimitKg = frontLimitKg,
            RearAxleLimitKg = rearLimitKg,
            IsFrontOverloaded = isFrontOverloaded,
            IsRearOverloaded = isRearOverloaded,
            MarginOfErrorPercentage = 3.0m,
            CalculationSummary = result.FormulaSummary
        };
        _context.AxleLoadCalculations.Add(entity);
        await _context.SaveChangesAsync(ct);

        return result;
    }
}
