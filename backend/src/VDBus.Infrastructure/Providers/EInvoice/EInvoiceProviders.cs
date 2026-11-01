using System;
using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.EInvoice;

namespace VDBus.Infrastructure.Providers.EInvoice;

public class MockEInvoiceProvider : IEInvoiceProvider
{
    private static readonly ConcurrentDictionary<string, EInvoiceResultDto> IssuedInvoices = new();
    private static int _counter = 1200;

    public Task<EInvoiceResultDto> IssueEInvoiceAsync(IssueEInvoiceRequestDto request, CancellationToken ct = default)
    {
        int invNum = Interlocked.Increment(ref _counter);
        string invoiceNumber = invNum.ToString("D7");
        string lookupCode = $"VDBUS-{Guid.NewGuid():N}"[..14].ToUpperInvariant();
        string taxAuthorityCode = $"00{Guid.NewGuid():N}"[..23].ToUpperInvariant();
        DateTime issuedAt = DateTime.UtcNow;

        // Sinh nội dung XML chuẩn hóa có khối chữ ký số điện tử XMLDSig
        string rawPayload = $"<Invoice id=\"{request.InvoiceId}\"><InvNum>{invoiceNumber}</InvNum><BuyerTaxCode>{request.CustomerTaxCode}</BuyerTaxCode><BuyerName>{request.CustomerName}</BuyerName><TotalAmount>{request.TotalAmountVnd}</TotalAmount><TaxRate>{request.TaxPercentage}%</TaxRate><IssuedAt>{issuedAt:O}</IssuedAt></Invoice>";
        
        using var sha256 = SHA256.Create();
        byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawPayload));
        string signatureHash = Convert.ToHexString(hashBytes).ToLowerInvariant();

        string signedXml = $"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<HDon>\n  <DLHDon Id=\"HD_{invoiceNumber}\">\n    <TTChung>\n      <KHMSHDon>1</KHMSHDon>\n      <KHHDon>1C26TND</KHHDon>\n      <SHDon>{invoiceNumber}</SHDon>\n      <NLap>{issuedAt:yyyy-MM-dd}</NLap>\n      <DVTTe>VND</DVTTe>\n    </TTChung>\n    <NDHDon>\n      <NBan>\n        <Ten>CONG TY CO PHAN LOGISTICS VDBUS</Ten>\n        <MST>0401829148</MST>\n        <DChi>KCN Hoa Cam, Quan Cam Le, TP. Da Nang</DChi>\n      </NBan>\n      <NMua>\n        <Ten>{request.CustomerName}</Ten>\n        <MST>{request.CustomerTaxCode}</MST>\n        <DChi>{request.CustomerAddress}</DChi>\n      </NMua>\n      <TToan>\n        <TgTCThue>{request.SubtotalVnd}</TgTCThue>\n        <TgTThue>{request.TotalAmountVnd - request.SubtotalVnd}</TgTThue>\n        <TgTTTBSo>{request.TotalAmountVnd}</TgTTTBSo>\n      </TToan>\n    </NDHDon>\n  </DLHDon>\n  <MCCQT>{taxAuthorityCode}</MCCQT>\n  <Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\">\n    <SignedInfo>\n      <DigestValue>{Convert.ToBase64String(hashBytes)}</DigestValue>\n    </SignedInfo>\n    <SignatureValue>{signatureHash}</SignatureValue>\n  </Signature>\n</HDon>";

        var result = new EInvoiceResultDto
        {
            InvoiceId = request.InvoiceId,
            EInvoiceNumber = invoiceNumber,
            InvoiceSeries = "1C26TND",
            TaxAuthorityCode = taxAuthorityCode,
            LookupCode = lookupCode,
            LookupPortalUrl = "https://hoadondientu.gdt.gov.vn",
            DigitalSignatureHash = signatureHash,
            SignedXmlPayload = signedXml,
            IssuedAtUtc = issuedAt,
            IsSimulated = true
        };

        IssuedInvoices[lookupCode] = result;
        return Task.FromResult(result);
    }

    public Task<EInvoiceResultDto?> GetEInvoiceByLookupCodeAsync(string lookupCode, CancellationToken ct = default)
    {
        IssuedInvoices.TryGetValue(lookupCode.Trim().ToUpperInvariant(), out var result);
        return Task.FromResult(result);
    }
}

public class RealEInvoiceProvider : IEInvoiceProvider
{
    public Task<EInvoiceResultDto> IssueEInvoiceAsync(IssueEInvoiceRequestDto request, CancellationToken ct = default)
    {
        throw new NotImplementedException("Tích hợp API phát hành hóa đơn điện tử chính thức (VNPT / Viettel / MISA) cần cấu hình Token USB hoặc HSM của doanh nghiệp.");
    }

    public Task<EInvoiceResultDto?> GetEInvoiceByLookupCodeAsync(string lookupCode, CancellationToken ct = default)
    {
        throw new NotImplementedException("Tra cứu trực tiếp qua Cổng thông tin Tổng cục Thuế yêu cầu chứng thư số hợp lệ.");
    }
}
