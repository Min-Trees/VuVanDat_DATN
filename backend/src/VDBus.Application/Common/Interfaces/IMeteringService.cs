using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Metering;

namespace VDBus.Application.Common.Interfaces;

public interface IMeteringService
{
    Task<TenantUsageMeteringDto> GetTenantUsageMeteringAsync(Guid? tenantId = null, CancellationToken ct = default);
    Task<IReadOnlyList<SubscriptionPlanDto>> GetSubscriptionPlansAsync(CancellationToken ct = default);
    Task<bool> CanCreateVehicleAsync(Guid? tenantId = null, CancellationToken ct = default);
    Task<bool> CanCreateOrderAsync(Guid? tenantId = null, CancellationToken ct = default);
}
