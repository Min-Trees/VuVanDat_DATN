using System;
using VDBus.Domain.Enums;

namespace VDBus.Application.DTOs.Hos;

public class HosStatusDto
{
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string VehiclePlate { get; set; } = string.Empty;
    public int ContinuousDrivingMinutes { get; set; }
    public int RemainingContinuousMinutes { get; set; }
    public int DailyDrivingMinutes { get; set; }
    public int RemainingDailyMinutes { get; set; }
    public HosAlertLevel AlertLevel { get; set; } = HosAlertLevel.Normal;
    public string AlertMessage { get; set; } = string.Empty;
    public int NextRequiredRestMinutes { get; set; } = 15;
    public string LegalNotice { get; set; } = "Hạn mức giờ lái được cấu hình theo quy định nội bộ và cần chuyên gia pháp lý xác nhận.";
}
