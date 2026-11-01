using System;

namespace VDBus.Application.DTOs.Payments;

public class VietQrResponseDto
{
    public Guid InvoiceId { get; set; }
    public string InvoiceCode { get; set; } = string.Empty;
    public string BankCode { get; set; } = "VCB"; // Vietcombank, Techcombank, v.v.
    public string AccountNumber { get; set; } = "1028491823";
    public string AccountName { get; set; } = "CONG TY CP LOGISTICS VDBUS";
    public decimal AmountVnd { get; set; }
    public string PaymentDescription { get; set; } = string.Empty; // e.g. "VDBUS HD-2026-0001"
    public string QrImageUrl { get; set; } = string.Empty;
    public string QrCodeText { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
}

public class BankingWebhookPayloadDto
{
    public string TransactionId { get; set; } = string.Empty; // Mã giao dịch ngân hàng
    public string IdempotencyKey { get; set; } = string.Empty; // Chống lặp
    public string BankCode { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public decimal AmountVnd { get; set; }
    public string Content { get; set; } = string.Empty; // Nội dung chuyển khoản
    public DateTime TransactionDateUtc { get; set; } = DateTime.UtcNow;
    public string Signature { get; set; } = string.Empty;
}

public class BankingWebhookResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? MatchedInvoiceId { get; set; }
    public string InvoiceCode { get; set; } = string.Empty;
    public bool IsAlreadyProcessed { get; set; }
}
