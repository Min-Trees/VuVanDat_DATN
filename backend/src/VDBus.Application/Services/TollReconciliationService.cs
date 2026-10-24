using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Toll;
using VDBus.Domain.Entities;

namespace VDBus.Application.Services;

public class TollReconciliationService : ITollReconciliationService
{
    private readonly IApplicationDbContext _context;
    private readonly IVetcProvider _vetcProvider;

    public TollReconciliationService(
        IApplicationDbContext context,
        IVetcProvider vetcProvider)
    {
        _context = context;
        _vetcProvider = vetcProvider;
    }

    public async Task<TollReconciliationResultDto> SyncAndReconcileTripTollsAsync(Guid tripId, CancellationToken ct = default)
    {
        var trip = await _context.Trips
            .Include(t => t.Vehicle)
            .FirstOrDefaultAsync(t => t.Id == tripId, ct);

        if (trip == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy chuyến xe có mã ID: {tripId}");
        }

        var licensePlate = trip.Vehicle?.LicensePlate ?? string.Empty;
        var fromUtc = trip.StartTimeUtc ?? trip.CreatedAtUtc;
        var toUtc = trip.EndTimeUtc ?? DateTime.UtcNow;

        // Gọi nhà cung cấp VETC (Mock hoặc Real) để lấy lịch sử trừ tiền
        var providerTransactions = await _vetcProvider.GetTransactionsByPlateAsync(licensePlate, fromUtc, toUtc, ct);

        var reconciledDtos = new List<TollTransactionDto>();
        decimal totalAmount = 0m;

        foreach (var pTx in providerTransactions)
        {
            // Kiểm tra trùng lặp mã giao dịch
            var existing = await _context.TollTransactions
                .FirstOrDefaultAsync(t => t.TransactionCode == pTx.TransactionId, ct);

            if (existing == null)
            {
                existing = new TollTransaction
                {
                    TenantId = trip.TenantId,
                    TransactionCode = pTx.TransactionId,
                    StationName = pTx.StationName,
                    TollProvider = "VETC",
                    VehicleId = trip.VehicleId,
                    TripId = trip.Id,
                    AmountVnd = pTx.TollAmountVnd,
                    PassedAtUtc = pTx.TimestampUtc,
                    IsReconciled = true,
                    IsSimulated = pTx.IsSimulated,
                    Notes = $"Đối soát tự động từ {_vetcProvider.GetType().Name}"
                };
                _context.TollTransactions.Add(existing);
            }
            else
            {
                existing.TripId = trip.Id;
                existing.IsReconciled = true;
            }

            totalAmount += existing.AmountVnd;
            reconciledDtos.Add(new TollTransactionDto
            {
                Id = existing.Id,
                TransactionCode = existing.TransactionCode,
                StationName = existing.StationName,
                TollProvider = existing.TollProvider,
                AmountVnd = existing.AmountVnd,
                PassedAtUtc = existing.PassedAtUtc,
                IsReconciled = existing.IsReconciled,
                IsSimulated = existing.IsSimulated
            });
        }

        await _context.SaveChangesAsync(ct);

        return new TollReconciliationResultDto
        {
            TripId = trip.Id,
            TripCode = trip.TripCode,
            LicensePlate = licensePlate,
            TotalTollAmountVnd = totalAmount,
            StationCount = reconciledDtos.Count,
            Transactions = reconciledDtos,
            IsSimulated = _vetcProvider.IsMock
        };
    }

    public async Task<IReadOnlyList<TollTransaction>> GetTollTransactionsAsync(Guid? tripId, string? licensePlate, CancellationToken ct = default)
    {
        var query = _context.TollTransactions
            .Include(t => t.Vehicle)
            .Include(t => t.Trip)
            .AsNoTracking();

        if (tripId.HasValue)
        {
            query = query.Where(t => t.TripId == tripId.Value);
        }

        if (!string.IsNullOrEmpty(licensePlate))
        {
            query = query.Where(t => t.Vehicle != null && t.Vehicle.LicensePlate == licensePlate);
        }

        return await query.OrderByDescending(t => t.PassedAtUtc).ToListAsync(ct);
    }
}
