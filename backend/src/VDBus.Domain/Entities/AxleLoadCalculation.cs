using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class AxleLoadCalculation : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }
    public decimal TotalCargoWeightKg { get; set; }
    public int CenterOfGravityMmFromFront { get; set; } // Vị trí trọng tâm hàng hóa (mm)
    public decimal FrontAxleLoadKg { get; set; } // Lực đè trục trước (kg)
    public decimal RearAxleLoadKg { get; set; } // Lực đè trục sau (kg)
    public decimal FrontAxleLimitKg { get; set; } // Giới hạn quy định trục trước
    public decimal RearAxleLimitKg { get; set; } // Giới hạn quy định trục sau
    public bool IsFrontOverloaded { get; set; }
    public bool IsRearOverloaded { get; set; }
    public decimal MarginOfErrorPercentage { get; set; } = 3.0m; // Biên sai số ước tính (+-3%)
    public string? CalculationSummary { get; set; } // Diễn giải công thức đòn bẩy tĩnh học
}
