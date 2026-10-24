using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Toll;
using VDBus.Domain.Entities;

namespace VDBus.Application.Common.Interfaces;

public interface ITollReconciliationService
{
    Task<TollReconciliationResultDto> SyncAndReconcileTripTollsAsync(Guid tripId, CancellationToken ct = default);
    Task<IReadOnlyList<TollTransaction>> GetTollTransactionsAsync(Guid? tripId, string? licensePlate, CancellationToken ct = default);
}
