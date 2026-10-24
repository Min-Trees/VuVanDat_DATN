using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Telematics;
using VDBus.Domain.Entities;

namespace VDBus.Application.Services;

public class TelematicsService : ITelematicsService
{
    private readonly IApplicationDbContext _context;
    private readonly ITelematicsNotificationService _notificationService;

    public TelematicsService(
        IApplicationDbContext context,
        ITelematicsNotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<TelemetryDto> IngestTelemetryAsync(TelemetryDto telemetry, CancellationToken ct = default)
    {
        if (telemetry.RecordedAtUtc == default)
        {
            telemetry.RecordedAtUtc = DateTime.UtcNow;
        }

        // Serialize Tire pressures if present
        if (telemetry.TirePressures.Count > 0 && string.IsNullOrWhiteSpace(telemetry.TirePressuresJson))
        {
            telemetry.TirePressuresJson = JsonSerializer.Serialize(telemetry.TirePressures);
        }

        var record = new TelemetryRecord
        {
            TenantId = telemetry.TenantId,
            VehicleId = telemetry.VehicleId,
            DeviceId = telemetry.DeviceId,
            RecordedAtUtc = telemetry.RecordedAtUtc,
            Latitude = telemetry.Latitude,
            Longitude = telemetry.Longitude,
            SpeedKmh = telemetry.SpeedKmh,
            HeadingDegrees = telemetry.HeadingDegrees,
            TemperatureCelsius = telemetry.TemperatureCelsius,
            HumidityPercentage = telemetry.HumidityPercentage,
            FuelLevelPercentage = telemetry.FuelLevelPercentage,
            TirePressuresJson = telemetry.TirePressuresJson,
            IsDoorOpen = telemetry.IsDoorOpen,
            IsSimulated = telemetry.IsSimulated
        };

        _context.TelemetryRecords.Add(record);

        // Update vehicle live position
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == telemetry.VehicleId, ct);
        if (vehicle != null)
        {
            vehicle.CurrentLocationLat = telemetry.Latitude;
            vehicle.CurrentLocationLng = telemetry.Longitude;
            vehicle.LastLocationUpdateUtc = telemetry.RecordedAtUtc;
            telemetry.LicensePlate = vehicle.LicensePlate;
        }

        await _context.SaveChangesAsync(ct);

        // Broadcast to clients via SignalR notification service
        await _notificationService.BroadcastTelemetryAsync(telemetry, ct);

        return telemetry;
    }

    public async Task<IReadOnlyList<TelemetryDto>> GetLatestFleetLocationsAsync(CancellationToken ct = default)
    {
        var vehicles = await _context.Vehicles
            .AsNoTracking()
            .Where(v => v.CurrentLocationLat.HasValue && v.CurrentLocationLng.HasValue)
            .ToListAsync(ct);

        var list = new List<TelemetryDto>();

        foreach (var v in vehicles)
        {
            // Get latest telemetry record for vehicle if any
            var latestRecord = await _context.TelemetryRecords
                .AsNoTracking()
                .Where(t => t.VehicleId == v.Id)
                .OrderByDescending(t => t.RecordedAtUtc)
                .FirstOrDefaultAsync(ct);

            list.Add(new TelemetryDto
            {
                TenantId = v.TenantId,
                VehicleId = v.Id,
                LicensePlate = v.LicensePlate,
                Latitude = v.CurrentLocationLat ?? 16.074,
                Longitude = v.CurrentLocationLng ?? 108.153,
                SpeedKmh = latestRecord?.SpeedKmh ?? 0,
                HeadingDegrees = latestRecord?.HeadingDegrees ?? 0,
                TemperatureCelsius = latestRecord?.TemperatureCelsius,
                FuelLevelPercentage = latestRecord?.FuelLevelPercentage,
                TirePressuresJson = latestRecord?.TirePressuresJson,
                RecordedAtUtc = v.LastLocationUpdateUtc ?? v.UpdatedAtUtc ?? v.CreatedAtUtc,
                IsSimulated = v.IsSimulated
            });
        }

        return list;
    }

    public async Task<IReadOnlyList<TelemetryDto>> GetVehicleTelemetryHistoryAsync(
        Guid vehicleId,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken ct = default)
    {
        var vehicle = await _context.Vehicles.AsNoTracking().FirstOrDefaultAsync(v => v.Id == vehicleId, ct);

        var records = await _context.TelemetryRecords
            .AsNoTracking()
            .Where(t => t.VehicleId == vehicleId && t.RecordedAtUtc >= fromUtc && t.RecordedAtUtc <= toUtc)
            .OrderBy(t => t.RecordedAtUtc)
            .ToListAsync(ct);

        return records.Select(r => new TelemetryDto
        {
            TenantId = r.TenantId,
            VehicleId = r.VehicleId,
            DeviceId = r.DeviceId,
            LicensePlate = vehicle?.LicensePlate ?? string.Empty,
            Latitude = r.Latitude,
            Longitude = r.Longitude,
            SpeedKmh = r.SpeedKmh,
            HeadingDegrees = r.HeadingDegrees,
            TemperatureCelsius = r.TemperatureCelsius,
            HumidityPercentage = r.HumidityPercentage,
            FuelLevelPercentage = r.FuelLevelPercentage,
            TirePressuresJson = r.TirePressuresJson,
            IsDoorOpen = r.IsDoorOpen,
            RecordedAtUtc = r.RecordedAtUtc,
            IsSimulated = r.IsSimulated
        }).ToList();
    }
}
