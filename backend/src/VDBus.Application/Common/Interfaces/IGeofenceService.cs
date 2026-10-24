using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Domain.Entities;

namespace VDBus.Application.Common.Interfaces;

public interface IGeofenceService
{
    Task<IReadOnlyList<Geofence>> GetGeofencesAsync(CancellationToken ct = default);
    Task<Geofence> CreateGeofenceAsync(Geofence geofence, CancellationToken ct = default);
    Task<DetentionRecord?> ProcessVehicleLocationAsync(Guid vehicleId, double lat, double lng, DateTime timestampUtc, CancellationToken ct = default);
    Task<IReadOnlyList<DetentionRecord>> GetDetentionRecordsAsync(string? status, CancellationToken ct = default);
}
