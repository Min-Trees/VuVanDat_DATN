using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Hos;

namespace VDBus.Application.Common.Interfaces;

public interface IHosService
{
    Task<HosStatusDto> CalculateDriverHosStatusAsync(Guid driverId, DateTime asOfUtc, CancellationToken ct = default);
    Task<IReadOnlyList<HosStatusDto>> GetFleetHosOverviewAsync(CancellationToken ct = default);
}
