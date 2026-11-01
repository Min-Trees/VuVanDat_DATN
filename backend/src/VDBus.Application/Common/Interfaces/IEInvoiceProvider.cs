using System;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.EInvoice;

namespace VDBus.Application.Common.Interfaces;

public interface IEInvoiceProvider
{
    Task<EInvoiceResultDto> IssueEInvoiceAsync(IssueEInvoiceRequestDto request, CancellationToken ct = default);
    Task<EInvoiceResultDto?> GetEInvoiceByLookupCodeAsync(string lookupCode, CancellationToken ct = default);
}
