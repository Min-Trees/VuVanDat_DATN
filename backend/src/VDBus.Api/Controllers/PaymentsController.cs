using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Payments;

namespace VDBus.Api.Controllers;

public class GenerateVietQrRequest
{
    public Guid InvoiceId { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IVietQrService _vietQrService;

    public PaymentsController(IVietQrService vietQrService)
    {
        _vietQrService = vietQrService;
    }

    [HttpPost("vietqr/generate")]
    [Authorize]
    public async Task<ActionResult<VietQrResponseDto>> GenerateVietQr([FromBody] GenerateVietQrRequest request, CancellationToken ct)
    {
        try
        {
            var qr = await _vietQrService.GenerateInvoiceVietQrAsync(request.InvoiceId, ct);
            return Ok(qr);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("vietqr/webhook")]
    [AllowAnonymous]
    public async Task<ActionResult<BankingWebhookResultDto>> HandleBankingWebhook([FromBody] BankingWebhookPayloadDto payload, CancellationToken ct)
    {
        try
        {
            var result = await _vietQrService.ProcessBankingWebhookAsync(payload, ct);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new BankingWebhookResultDto
            {
                Success = false,
                Message = $"Lỗi xử lý webhook ngân hàng: {ex.Message}"
            });
        }
    }
}
