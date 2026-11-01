namespace VDBus.Domain.Enums;

public enum MaintenanceType
{
    PeriodicCheck,       // Bảo dưỡng định kỳ theo số km (5.000km, 10.000km, v.v.)
    EngineRepair,        // Sửa chữa động cơ / máy
    BrakeOverhaul,       // Bảo dưỡng hệ thống phanh / thắng
    TireReplacement,     // Thay lốp / đảo lốp
    InspectionRegistration // Đăng kiểm định kỳ nhà nước
}
