using System;
using System.Collections.Generic;

namespace VDBus.Application.DTOs.Toll;

public class TollTransactionDto
{
    public Guid Id { get; set; }
    public string TransactionCode { get; set; } = string.Empty;
    public string StationName { get; set; } = string.Empty;
    public string TollProvider { get; set; } = "VETC";
    public decimal AmountVnd { get; set; }
    public DateTime PassedAtUtc { get; set; }
    public bool IsReconciled { get; set; }
    public bool IsSimulated { get; set; }
}

public class TollReconciliationResultDto
{
    public Guid TripId { get; set; }
    public string TripCode { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public decimal TotalTollAmountVnd { get; set; }
    public int StationCount { get; set; }
    public List<TollTransactionDto> Transactions { get; set; } = new();
    public bool IsSimulated { get; set; } = true;
}
