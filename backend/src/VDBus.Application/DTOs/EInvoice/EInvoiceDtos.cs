using System;

namespace VDBus.Application.DTOs.EInvoice;

public class IssueEInvoiceRequestDto
{
    public Guid InvoiceId { get; set; }
    public string CustomerTaxCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string BuyerEmail { get; set; } = string.Empty;
    public decimal SubtotalVnd { get; set; }
    public decimal TaxPercentage { get; set; } = 8.0m; // 8% hoặc 10%
    public decimal TotalAmountVnd { get; set; }
    public string GoodsDescription { get; set; } = "Cước vận tải hàng hóa đường bộ";
}

public class EInvoiceResultDto
{
    public Guid InvoiceId { get; set; }
    public string EInvoiceNumber { get; set; } = string.Empty; // e.g. "0001248"
    public string InvoiceSeries { get; set; } = "1C26TND";    // Ký hiệu mẫu hóa đơn (1: HĐ GTGT điện tử, C: có mã CQT, 26: năm 2026, T: vận tải)
    public string TaxAuthorityCode { get; set; } = string.Empty; // Mã cơ quan thuế cấp
    public string LookupCode { get; set; } = string.Empty;    // Mã tra cứu hóa đơn
    public string LookupPortalUrl { get; set; } = "https://hoadondientu.gdt.gov.vn";
    public string DigitalSignatureHash { get; set; } = string.Empty;
    public string SignedXmlPayload { get; set; } = string.Empty;
    public DateTime IssuedAtUtc { get; set; }
    public bool IsSimulated { get; set; } = true;
}
