using System;
using VDBus.Domain.Common;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Entities;

public class Invoice : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string InvoiceCode { get; set; } = string.Empty; // HD-2026-0001
    public Guid CustomerId { get; set; }
    public Guid? OrderId { get; set; }

    public decimal SubtotalVnd { get; set; }
    public decimal TaxPercent { get; set; } = 8.0m; // VAT 8% hoặc 10%
    public decimal TaxAmountVnd { get; set; }
    public decimal TotalAmountVnd { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime IssuedDateUtc { get; set; } = DateTime.UtcNow;
    public DateTime DueDateUtc { get; set; }
    public DateTime? PaymentDateUtc { get; set; }
    public string PaymentReference { get; set; } = string.Empty; // Mã giao dịch ngân hàng / VietQR
    public string Notes { get; set; } = string.Empty;

    // Navigation
    public Customer? Customer { get; set; }
    public Order? Order { get; set; }
}
