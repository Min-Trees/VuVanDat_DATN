using System;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Dispatch;

namespace VDBus.Application.Common.Interfaces;

public interface IDispatchRecommendationService
{
    Task<DispatchRecommendationResultDto> GetRecommendationsForOrderAsync(Guid orderId, CancellationToken ct = default);
}
