using System;
using System.Collections.Generic;
using VDBus.Domain.Common;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Entities;

public class Vehicle : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string LicensePlate { get; set; } = string.Empty; // Biển số xe (29C-123.45)
    public VehicleType Type { get; set; } = VehicleType.MediumTruck;
    public string MakeModel { get; set; } = string.Empty; // Ví dụ: Hino 500, Isuzu FVR
    public decimal MaxPayloadKg { get; set; } // Tải trọng hàng hóa tối đa (kg)
    public decimal CargoVolumeCbm { get; set; } // Thể tích thùng xe (m3)
    public int LengthMm { get; set; } // Chiều dài lòng thùng (mm)
    public int WidthMm { get; set; } // Chiều rộng lòng thùng (mm)
    public int HeightMm { get; set; } // Chiều cao lòng thùng (mm)
    public int AxleCount { get; set; } = 2; // Số lượng trục (phục vụ tính tải trọng trục)
    public decimal FuelConsumptionLitrePer100Km { get; set; } = 18.5m; // Định mức tiêu hao (L/100km)
    public string Status { get; set; } = "Available"; // Available, OnTrip, Maintenance, Inactive
    public double? CurrentLocationLat { get; set; }
    public double? CurrentLocationLng { get; set; }
    public DateTime? LastLocationUpdateUtc { get; set; }
    public bool IsSimulated { get; set; } = false; // Gắn nhãn dữ liệu mô phỏng

    // Navigation
    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
}
