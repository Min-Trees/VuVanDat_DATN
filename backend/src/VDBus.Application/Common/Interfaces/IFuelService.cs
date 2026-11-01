using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Fuel;

namespace VDBus.Application.Common.Interfaces;

public interface IFuelService
{
    Task<FuelRecordDto> CreateFuelRecordAsync(CreateFuelRecordRequestDto request, CancellationToken ct = default);
    Task<IReadOnlyList<FuelRecordDto>> GetVehicleFuelRecordsAsync(Guid vehicleId, DateTime? fromUtc = null, DateTime? toUtc = null, CancellationToken ct = default);
    Task<FuelConsumptionSummaryDto> GetVehicleConsumptionSummaryAsync(Guid vehicleId, DateTime fromUtc, DateTime toUtc, CancellationToken ct = default);
}
