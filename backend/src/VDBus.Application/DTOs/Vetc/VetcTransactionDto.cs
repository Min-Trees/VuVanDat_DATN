using System;

namespace VDBus.Application.DTOs.Vetc;

public class VetcTransactionDto
{
    public string TransactionId { get; set; } = string.Empty;
    public string StationName { get; set; } = string.Empty;
    public string StationCode { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public decimal TollAmountVnd { get; set; }
    public DateTime TimestampUtc { get; set; }
    public bool IsSimulated { get; set; } // true khi nguồn là mock, false khi từ hệ thống thực
    public string ProviderSource { get; set; } = "Mock";
}
