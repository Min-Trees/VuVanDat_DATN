using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.PnL;

namespace VDBus.Application.Common.Interfaces;

public interface IPnLService
{
    Task<PnLSummaryDto> GetOverallPnLSummaryAsync(PnLReportFilterDto filter, CancellationToken ct = default);
    Task<IReadOnlyList<VehiclePnLDto>> GetVehiclePnLBreakdownAsync(PnLReportFilterDto filter, CancellationToken ct = default);
    Task<IReadOnlyList<TripPnLDto>> GetTripPnLBreakdownAsync(PnLReportFilterDto filter, CancellationToken ct = default);
    Task<IReadOnlyList<CustomerPnLDto>> GetCustomerPnLBreakdownAsync(PnLReportFilterDto filter, CancellationToken ct = default);
    Task<IReadOnlyList<RoutePnLDto>> GetRoutePnLBreakdownAsync(PnLReportFilterDto filter, CancellationToken ct = default);
}
