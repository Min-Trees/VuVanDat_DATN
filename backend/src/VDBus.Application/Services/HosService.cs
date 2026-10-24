using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Hos;
using VDBus.Domain.Enums;

namespace VDBus.Application.Services;

public class HosService : IHosService
{
    private readonly IApplicationDbContext _context;

    // Các ngưỡng cấu hình an toàn giờ lái (mặc định theo luật giao thông đường bộ)
    public const int MaxContinuousMinutes = 240; // 4 giờ
    public const int MaxDailyMinutes = 600; // 10 giờ
    public const int MinRestToResetContinuous = 15; // 15 phút nghỉ ngơi

    public HosService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HosStatusDto> CalculateDriverHosStatusAsync(Guid driverId, DateTime asOfUtc, CancellationToken ct = default)
    {
        var driver = await _context.Drivers
            .Include(d => d.AssignedVehicle)
            .FirstOrDefaultAsync(d => d.Id == driverId, ct);

        if (driver == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy tài xế với mã ID: {driverId}");
        }

        var result = new HosStatusDto
        {
            DriverId = driver.Id,
            DriverName = driver.FullName,
            VehiclePlate = driver.AssignedVehicle?.LicensePlate ?? "Chưa gán xe",
            NextRequiredRestMinutes = MinRestToResetContinuous
        };

        if (driver.AssignedVehicleId == null)
        {
            result.RemainingContinuousMinutes = MaxContinuousMinutes;
            result.RemainingDailyMinutes = MaxDailyMinutes;
            result.AlertLevel = HosAlertLevel.Normal;
            result.AlertMessage = "Tài xế đang không điều khiển phương tiện.";
            return result;
        }

        var startOfDayUtc = asOfUtc.Date;
        var vehicleId = driver.AssignedVehicleId.Value;

        // Lấy toàn bộ telemetry records trong ngày của xe
        var records = await _context.TelemetryRecords
            .AsNoTracking()
            .Where(t => t.VehicleId == vehicleId && t.RecordedAtUtc >= startOfDayUtc && t.RecordedAtUtc <= asOfUtc)
            .OrderBy(t => t.RecordedAtUtc)
            .ToListAsync(ct);

        if (records.Count == 0)
        {
            result.RemainingContinuousMinutes = MaxContinuousMinutes;
            result.RemainingDailyMinutes = MaxDailyMinutes;
            result.AlertLevel = HosAlertLevel.Normal;
            result.AlertMessage = "Chưa ghi nhận dữ liệu di chuyển trong ngày.";
            return result;
        }

        int continuousMinutes = 0;
        int dailyMinutes = 0;
        DateTime? lastDrivingTime = null;
        DateTime? stopStartTime = null;

        for (int i = 0; i < records.Count; i++)
        {
            var cur = records[i];
            bool isMoving = cur.SpeedKmh > 5.0;

            if (isMoving)
            {
                if (stopStartTime.HasValue)
                {
                    var stopDuration = (cur.RecordedAtUtc - stopStartTime.Value).TotalMinutes;
                    if (stopDuration >= MinRestToResetContinuous)
                    {
                        // Đã nghỉ đủ 15 phút -> Đặt lại đếm giờ lái liên tục
                        continuousMinutes = 0;
                    }
                    stopStartTime = null;
                }

                if (lastDrivingTime.HasValue)
                {
                    var deltaMinutes = (int)Math.Max(1, Math.Min(30, (cur.RecordedAtUtc - lastDrivingTime.Value).TotalMinutes));
                    continuousMinutes += deltaMinutes;
                    dailyMinutes += deltaMinutes;
                }
                else
                {
                    continuousMinutes += 1;
                    dailyMinutes += 1;
                }
                lastDrivingTime = cur.RecordedAtUtc;
            }
            else
            {
                // Xe dừng
                if (!stopStartTime.HasValue)
                {
                    stopStartTime = cur.RecordedAtUtc;
                }
                else
                {
                    var currentStopDuration = (cur.RecordedAtUtc - stopStartTime.Value).TotalMinutes;
                    if (currentStopDuration >= MinRestToResetContinuous)
                    {
                        continuousMinutes = 0;
                    }
                }
                lastDrivingTime = null;
            }
        }

        result.ContinuousDrivingMinutes = continuousMinutes;
        result.DailyDrivingMinutes = dailyMinutes;
        result.RemainingContinuousMinutes = Math.Max(0, MaxContinuousMinutes - continuousMinutes);
        result.RemainingDailyMinutes = Math.Max(0, MaxDailyMinutes - dailyMinutes);

        // Đánh giá mức độ cảnh báo
        if (continuousMinutes >= MaxContinuousMinutes || dailyMinutes >= MaxDailyMinutes)
        {
            result.AlertLevel = HosAlertLevel.Violation;
            result.AlertMessage = $"CẢNH BÁO VI PHẠM: Tài xế đã vượt quá hạn mức lái xe an toàn ({continuousMinutes} phút liên tục / {dailyMinutes} phút trong ngày). Cần dừng xe nghỉ ngơi ngay lập tức!";
        }
        else if (result.RemainingContinuousMinutes <= 15 || result.RemainingDailyMinutes <= 15)
        {
            result.AlertLevel = HosAlertLevel.Critical15Min;
            result.AlertMessage = $"Cảnh báo khẩn cấp: Chỉ còn {result.RemainingContinuousMinutes} phút trước khi đạt ngưỡng tối đa 4 giờ lái liên tục. Hãy tìm trạm dừng nghỉ gần nhất!";
        }
        else if (result.RemainingContinuousMinutes <= 30 || result.RemainingDailyMinutes <= 30)
        {
            result.AlertLevel = HosAlertLevel.Warning30Min;
            result.AlertMessage = $"Nhắc nhở an toàn: Còn {result.RemainingContinuousMinutes} phút nữa cần nghỉ ngơi tối thiểu 15 phút.";
        }
        else
        {
            result.AlertLevel = HosAlertLevel.Normal;
            result.AlertMessage = $"Thời gian lái xe hợp lệ. Còn lại {result.RemainingContinuousMinutes} phút lái liên tục.";
        }

        return result;
    }

    public async Task<IReadOnlyList<HosStatusDto>> GetFleetHosOverviewAsync(CancellationToken ct = default)
    {
        var drivers = await _context.Drivers
            .AsNoTracking()
            .Where(d => d.Status == "OnTrip" || d.Status == "Available")
            .ToListAsync(ct);

        var list = new List<HosStatusDto>();
        var now = DateTime.UtcNow;

        foreach (var driver in drivers)
        {
            var status = await CalculateDriverHosStatusAsync(driver.Id, now, ct);
            list.Add(status);
        }

        return list.OrderByDescending(s => s.AlertLevel).ThenByDescending(s => s.ContinuousDrivingMinutes).ToList();
    }
}
