using System;
using System.Threading.Tasks;
using FluentAssertions;
using VDBus.Application.DTOs.EInvoice;
using VDBus.Infrastructure.Providers.EInvoice;
using Xunit;

namespace VDBus.Infrastructure.Tests;

public class EInvoiceProviderTests
{
    private readonly MockEInvoiceProvider _provider = new();

    [Fact]
    public async Task IssueEInvoice_ReturnsSignedXmlWithTaxCodeAndSignature()
    {
        var invoiceId = Guid.NewGuid();
        var request = new IssueEInvoiceRequestDto
        {
            InvoiceId = invoiceId,
            CustomerName = "Công ty CP Sữa Vinamilk",
            CustomerTaxCode = "0300588569",
            CustomerAddress = "10 Tân Trào, P. Tân Phú, Quận 7, TP. HCM",
            SubtotalVnd = 10000000m,
            TaxPercentage = 8.0m,
            TotalAmountVnd = 10800000m
        };

        var result = await _provider.IssueEInvoiceAsync(request);

        result.InvoiceId.Should().Be(invoiceId);
        result.EInvoiceNumber.Should().NotBeNullOrEmpty();
        result.TaxAuthorityCode.Should().StartWith("00");
        result.SignedXmlPayload.Should().Contain("<SignatureValue>");
        result.SignedXmlPayload.Should().Contain("1C26TND");
        result.DigitalSignatureHash.Should().HaveLength(64);
        result.IsSimulated.Should().BeTrue();
    }

    [Fact]
    public async Task GetEInvoiceByLookupCode_WhenIssued_ReturnsSameInvoice()
    {
        var request = new IssueEInvoiceRequestDto
        {
            InvoiceId = Guid.NewGuid(),
            CustomerName = "Tập đoàn Hòa Phát",
            CustomerTaxCode = "0900189281",
            CustomerAddress = "KCN Phố Nối A, Hưng Yên",
            SubtotalVnd = 25000000m,
            TotalAmountVnd = 27000000m
        };

        var issued = await _provider.IssueEInvoiceAsync(request);

        var retrieved = await _provider.GetEInvoiceByLookupCodeAsync(issued.LookupCode);

        retrieved.Should().NotBeNull();
        retrieved!.EInvoiceNumber.Should().Be(issued.EInvoiceNumber);
        retrieved.TaxAuthorityCode.Should().Be(issued.TaxAuthorityCode);
    }
}
