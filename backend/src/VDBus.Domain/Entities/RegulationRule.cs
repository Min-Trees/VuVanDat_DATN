using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

/// <summary>
/// Quy định cấm tải và giới hạn đường bộ cấu hình động theo địa phương / tuyến đường.
/// </summary>
public class RegulationRule : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string ProvinceCode { get; set; } = string.Empty; // Mã tỉnh/thành (e.g., HN, HCM, DN)
    public string RouteName { get; set; } = string.Empty; // Tuyến đường hoặc Vành đai áp dụng
    public string VehicleType { get; set; } = "All"; // Loại xe áp dụng (Xe tải nhẹ, Xe tải nặng, Container...)
    public TimeSpan StartTime { get; set; } // Khung giờ bắt đầu cấm (e.g., 06:00:00)
    public TimeSpan EndTime { get; set; } // Khung giờ kết thúc cấm (e.g., 09:00:00)
    public decimal MaxWeightTons { get; set; } // Trọng tải tối đa được phép lưu thông
    public decimal EstimatedFineVnd { get; set; } // Mức phạt tham khảo (ước tính)
    public string SourceReference { get; set; } = string.Empty; // Văn bản quy định (e.g., Quyết định 24/2020/QĐ-UBND)
    public string LegalNote { get; set; } = "Cần chuyên gia pháp lý xác nhận trước khi áp dụng chính thức";
    public bool IsActive { get; set; } = true;
}
