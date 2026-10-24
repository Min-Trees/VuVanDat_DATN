using System;
using System.Collections.Generic;

namespace VDBus.Application.DTOs.AxleLoad;

public class PalletItemDto
{
    public string PalletCode { get; set; } = string.Empty;
    public decimal WeightKg { get; set; }
    public int PositionMmFromFront { get; set; } // Khoảng cách từ đầu thùng xe (mm)
    public int LengthMm { get; set; } = 1200; // Tiêu chuẩn pallet 1200 x 1000 mm
    public int WidthMm { get; set; } = 1000;
}

public class AxleLoadCalculationRequestDto
{
    public Guid VehicleId { get; set; }
    public Guid? OrderId { get; set; }
    public List<PalletItemDto> Pallets { get; set; } = new();
    public decimal? TotalCargoWeightKg { get; set; }
    public int? CustomCenterOfGravityMm { get; set; }
}

public class AxleLoadResultDto
{
    public Guid VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public int AxleCount { get; set; }
    public decimal TotalGrossWeightKg { get; set; } // Tổng trọng lượng toàn bộ xe + hàng
    public decimal TotalCargoWeightKg { get; set; }
    public int CenterOfGravityMmFromFront { get; set; }
    public decimal FrontAxleLoadKg { get; set; }
    public decimal FrontAxleLimitKg { get; set; }
    public decimal FrontAxleUtilizationPct { get; set; }
    public bool IsFrontOverloaded { get; set; }
    public decimal RearAxleLoadKg { get; set; }
    public decimal RearAxleLimitKg { get; set; }
    public decimal RearAxleUtilizationPct { get; set; }
    public bool IsRearOverloaded { get; set; }
    public decimal MarginOfErrorPercentage { get; set; } = 3.0m;
    public string Status { get; set; } = "Safe"; // Safe, FrontOverloaded, RearOverloaded, GrossOverloaded
    public string Recommendation { get; set; } = string.Empty;
    public string FormulaSummary { get; set; } = string.Empty;
    public string Disclaimer { get; set; } = "Kết quả dựa trên tính toán mô-men tĩnh học lý thuyết (+-3% sai số). Cần đăng kiểm và chuyên gia pháp lý xác nhận.";
}
