using System;
using VDBus.Domain.Common;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Entities;

public class VehicleDocument : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public DocumentType DocumentType { get; set; } = DocumentType.InspectionCertificate;
    public string DocumentNumber { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty; // Cơ quan cấp (Sở GTVT, Trung tâm Đăng kiểm, Bảo hiểm...)
    public DateTime IssuedDateUtc { get; set; }
    public DateTime ExpiryDateUtc { get; set; }

    public int AlertBeforeDays { get; set; } = 30; // Cảnh báo trước 30 ngày
    public bool IsAlertActive { get; set; } = false;
    public string FileScanUrl { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public bool IsSimulated { get; set; } = true;
}
