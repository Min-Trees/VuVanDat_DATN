using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class FuelRecord : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? DriverId { get; set; }
    public Driver? Driver { get; set; }
    public Guid? TripId { get; set; }
    public Trip? Trip { get; set; }

    public decimal OdometerKm { get; set; }
    public decimal FuelLitre { get; set; }
    public decimal UnitPriceVnd { get; set; }
    public decimal TotalAmountVnd { get; set; }
    public string StationName { get; set; } = string.Empty;

    // Đối chiếu cảm biến dầu và thuật toán phát hiện bất thường
    public decimal? SensorLitreBeforeRefuel { get; set; }
    public decimal? SensorLitreAfterRefuel { get; set; }
    public double AbnormalityScore { get; set; } = 0.0; // 0.0 (bình thường) đến 1.0 (nguy cơ cao)
    public string AbnormalityReason { get; set; } = string.Empty;
    public double ConfidenceRating { get; set; } = 1.0; // Độ tin cậy tính toán (ví dụ: 0.95 = 95%)

    public DateTime PurchasedAtUtc { get; set; } = DateTime.UtcNow;
    public string ReceiptPhotoUrl { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public bool IsSimulated { get; set; } = true;
}
