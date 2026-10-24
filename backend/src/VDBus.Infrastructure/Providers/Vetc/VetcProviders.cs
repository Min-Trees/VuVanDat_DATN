using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Vetc;

namespace VDBus.Infrastructure.Providers.Vetc;

public class MockVetcProvider : IVetcProvider
{
    public bool IsMock => true;

    public Task<IReadOnlyList<VetcTransactionDto>> GetTransactionsByPlateAsync(
        string licensePlate,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken ct = default)
    {
        // Trả về dữ liệu mô phỏng theo các trạm thu phí thực tế tại Việt Nam
        var mockTransactions = new List<VetcTransactionDto>
        {
            new()
            {
                TransactionId = $"MOCK-VETC-{Guid.NewGuid():N}"[..18].ToUpperInvariant(),
                StationName = "Trạm thu phí BOT Pháp Vân - Cầu Giẽ",
                StationCode = "BOT-PV-CG",
                LicensePlate = licensePlate,
                TollAmountVnd = 75000,
                TimestampUtc = DateTime.UtcNow.AddHours(-3),
                IsSimulated = true,
                ProviderSource = "VETC Simulation Engine"
            },
            new()
            {
                TransactionId = $"MOCK-VETC-{Guid.NewGuid():N}"[..18].ToUpperInvariant(),
                StationName = "Trạm thu phí Cao tốc Cầu Giẽ - Ninh Bình",
                StationCode = "BOT-CG-NB",
                LicensePlate = licensePlate,
                TollAmountVnd = 110000,
                TimestampUtc = DateTime.UtcNow.AddHours(-1.5),
                IsSimulated = true,
                ProviderSource = "VETC Simulation Engine"
            }
        };

        return Task.FromResult<IReadOnlyList<VetcTransactionDto>>(mockTransactions);
    }
}

public class RealVetcProvider : IVetcProvider
{
    public bool IsMock => false;

    public Task<IReadOnlyList<VetcTransactionDto>> GetTransactionsByPlateAsync(
        string licensePlate,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken ct = default)
    {
        // Khi cấu hình Real, gọi API VETC e-toll thực tế qua kênh riêng kết nối doanh nghiệp
        return Task.FromResult<IReadOnlyList<VetcTransactionDto>>(new List<VetcTransactionDto>());
    }
}
