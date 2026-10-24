using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Domain.Entities;

namespace VDBus.Application.Services;

public class GeofenceService : IGeofenceService
{
    private readonly IApplicationDbContext _context;

    public GeofenceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Geofence>> GetGeofencesAsync(CancellationToken ct = default)
    {
        return await _context.Geofences
            .Include(g => g.Customer)
            .AsNoTracking()
            .OrderBy(g => g.Name)
            .ToListAsync(ct);
    }

    public async Task<Geofence> CreateGeofenceAsync(Geofence geofence, CancellationToken ct = default)
    {
        _context.Geofences.Add(geofence);
        await _context.SaveChangesAsync(ct);
        return geofence;
    }

    public async Task<DetentionRecord?> ProcessVehicleLocationAsync(
        Guid vehicleId,
        double lat,
        double lng,
        DateTime timestampUtc,
        CancellationToken ct = default)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == vehicleId, ct);
        if (vehicle == null) return null;

        var geofences = await _context.Geofences
            .Where(g => g.IsActive)
            .ToListAsync(ct);

        // Kiểm tra xem xe hiện đang có bản ghi lưu trú nào đang "Tracking" dở dang không
        var openRecord = await _context.DetentionRecords
            .Include(r => r.Geofence)
            .FirstOrDefaultAsync(r => r.VehicleId == vehicleId && r.Status == "Tracking" && r.DepartedAtUtc == null, ct);

        // Tìm Geofence mà tọa độ hiện tại đang nằm bên trong
        Geofence? currentGeofence = null;
        foreach (var g in geofences)
        {
            var distance = CalculateDistanceMeters(lat, lng, g.CenterLatitude, g.CenterLongitude);
            if (distance <= g.RadiusMeters)
            {
                currentGeofence = g;
                break;
            }
        }

        // Trường hợp 1: Xe đã rời khỏi Geofence cũ
        if (openRecord != null && (currentGeofence == null || currentGeofence.Id != openRecord.GeofenceId))
        {
            openRecord.DepartedAtUtc = timestampUtc;
            var totalStayMinutes = (int)Math.Max(0, (timestampUtc - openRecord.ArrivedAtUtc).TotalMinutes);
            var detentionMinutes = Math.Max(0, totalStayMinutes - openRecord.FreeTimeMinutes);
            var ratePerHour = openRecord.Geofence?.DetentionRatePerHourVnd ?? 150000m;

            var detentionFee = Math.Round((detentionMinutes / 60.0m) * ratePerHour, 0);

            openRecord.DetentionMinutes = detentionMinutes;
            openRecord.DetentionFeeVnd = detentionFee;
            openRecord.Status = detentionMinutes > 0 ? "Billed" : "Completed";
            openRecord.Notes = $"Tổng thời gian đỗ: {totalStayMinutes} phút (Miễn phí {openRecord.FreeTimeMinutes} phút, Tính phí neo {detentionMinutes} phút)";

            await _context.SaveChangesAsync(ct);
            return openRecord;
        }

        // Trường hợp 2: Xe vừa tiến vào một Geofence mới
        if (openRecord == null && currentGeofence != null)
        {
            // Tìm chuyến xe đang chạy gần nhất của xe nếu có
            var activeTrip = await _context.Trips
                .Where(t => t.VehicleId == vehicleId && t.Status == Domain.Enums.TripStatus.InProgress)
                .OrderByDescending(t => t.StartTimeUtc)
                .FirstOrDefaultAsync(ct);

            var newRecord = new DetentionRecord
            {
                TenantId = vehicle.TenantId,
                GeofenceId = currentGeofence.Id,
                VehicleId = vehicle.Id,
                CustomerId = currentGeofence.CustomerId,
                TripId = activeTrip?.Id,
                ArrivedAtUtc = timestampUtc,
                FreeTimeMinutes = currentGeofence.FreeTimeMinutes,
                DetentionMinutes = 0,
                DetentionFeeVnd = 0,
                Status = "Tracking",
                Notes = $"Xe vừa đi vào vùng địa lý kho: {currentGeofence.Name}"
            };

            _context.DetentionRecords.Add(newRecord);
            await _context.SaveChangesAsync(ct);
            return newRecord;
        }

        return openRecord;
    }

    public async Task<IReadOnlyList<DetentionRecord>> GetDetentionRecordsAsync(string? status, CancellationToken ct = default)
    {
        var query = _context.DetentionRecords
            .Include(r => r.Geofence)
            .Include(r => r.Vehicle)
            .Include(r => r.Customer)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        return await query.OrderByDescending(r => r.ArrivedAtUtc).ToListAsync(ct);
    }

    private static double CalculateDistanceMeters(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371000; // Bán kính Trái Đất (mét)
        var dLat = (lat2 - lat1) * Math.PI / 180.0;
        var dLon = (lon2 - lon1) * Math.PI / 180.0;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }
}
