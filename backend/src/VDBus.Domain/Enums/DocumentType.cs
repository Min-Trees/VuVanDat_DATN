namespace VDBus.Domain.Enums;

public enum DocumentType
{
    VehicleRegistration,      // Giấy đăng ký xe (Cà-vẹt)
    InspectionCertificate,    // Giấy chứng nhận kiểm định an toàn kỹ thuật & BVMT
    CivilLiabilityInsurance,  // Bảo hiểm TNDS bắt buộc
    PhysicalDamageInsurance,  // Bảo hiểm vật chất xe (thân vỏ)
    TransportBadge,           // Phù hiệu xe tải do Sở GTVT cấp
    DriverLicense             // Giấy phép lái xe (GPLX hạng C, FC)
}
