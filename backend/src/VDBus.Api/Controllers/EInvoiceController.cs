using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.EInvoice;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin,Accountant")]
public class EInvoiceController : ControllerBase
{
    private readonly IEInvoiceProvider _eInvoiceProvider;
    private readonly IApplicationDbContext _context;

    public EInvoiceController(IEInvoiceProvider eInvoiceProvider, IApplicationDbContext context)
    {
        _eInvoiceProvider = eInvoiceProvider;
        _context = context;
    }

    [HttpPost("issue/{invoiceId}")]
    public async Task<ActionResult<EInvoiceResultDto>> IssueEInvoice(Guid invoiceId, CancellationToken ct)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .FirstOrDefaultAsync(i => i.Id == invoiceId, ct);

        if (invoice == null)
        {
            return NotFound("Không tìm thấy thông tin hóa đơn.");
        }

        var customer = invoice.Customer;
        var request = new IssueEInvoiceRequestDto
        {
            InvoiceId = invoice.Id,
            CustomerTaxCode = customer?.TaxCode ?? "0100109106",
            CustomerName = customer?.Name ?? "Khách hàng doanh nghiệp",
            CustomerAddress = customer?.Address ?? "Việt Nam",
            BuyerEmail = customer?.Email ?? "billing@customer.vn",
            SubtotalVnd = invoice.SubtotalVnd,
            TaxPercentage = invoice.TaxPercent > 0 ? invoice.TaxPercent : 8.0m,
            TotalAmountVnd = invoice.TotalAmountVnd,
            GoodsDescription = $"Cước dịch vụ vận chuyển đường bộ theo hóa đơn {invoice.InvoiceCode}"
        };

        var result = await _eInvoiceProvider.IssueEInvoiceAsync(request, ct);

        invoice.Notes = (invoice.Notes ?? "") + $" [HĐĐT: {result.InvoiceSeries}-{result.EInvoiceNumber}, Tra cứu: {result.LookupCode}]";
        await _context.SaveChangesAsync(ct);

        return Ok(result);
    }

    [HttpGet("lookup/{lookupCode}")]
    [AllowAnonymous]
    public async Task<ActionResult<EInvoiceResultDto>> LookupEInvoice(string lookupCode, CancellationToken ct)
    {
        var result = await _eInvoiceProvider.GetEInvoiceByLookupCodeAsync(lookupCode, ct);
        if (result == null)
        {
            return NotFound("Không tìm thấy hóa đơn điện tử với mã tra cứu tương ứng.");
        }
        return Ok(result);
    }

    [HttpGet("compliance-notice")]
    [AllowAnonymous]
    public ActionResult<object> GetComplianceNotice()
    {
        return Ok(new
        {
            Standard = "Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC",
            ComplianceNotice = "Cần chuyên gia pháp lý và kế toán thuế xác nhận trước khi áp dụng phát hành hóa đơn sản xuất thương mại thực tế.",
            InvoiceSeriesFormat = "1C26TND",
            XmlSchema = "XMLDSig W3C Standard"
        });
    }
}
