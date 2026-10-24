using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Telematics;

namespace VDBus.Application.Common.Interfaces;

public interface ITelematicsService
{
    Task<TelemetryDto> IngestTelemetryAsync(TelemetryDto telemetry, CancellationToken ct = default);
    Task<IReadOnlyList<TelemetryDto>> GetLatestFleetLocationsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<TelemetryDto>> GetVehicleTelemetryHistoryAsync(Guid vehicleId, DateTime fromUtc, DateTime toUtc, CancellationToken ct = default);
}
