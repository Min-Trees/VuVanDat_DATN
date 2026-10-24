using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Vetc;

namespace VDBus.Application.Common.Interfaces;

public interface IVetcProvider
{
    bool IsMock { get; }
    Task<IReadOnlyList<VetcTransactionDto>> GetTransactionsByPlateAsync(
        string licensePlate,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken ct = default);
}
