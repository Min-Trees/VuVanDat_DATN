using System;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Payments;

namespace VDBus.Application.Common.Interfaces;

public interface IVietQrService
{
    Task<VietQrResponseDto> GenerateInvoiceVietQrAsync(Guid invoiceId, CancellationToken ct = default);
    Task<BankingWebhookResultDto> ProcessBankingWebhookAsync(BankingWebhookPayloadDto payload, CancellationToken ct = default);
}
