using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Copilot;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CopilotController : ControllerBase
{
    private readonly IAiCopilotService _copilotService;

    public CopilotController(IAiCopilotService copilotService)
    {
        _copilotService = copilotService;
    }

    [HttpPost("query")]
    public async Task<ActionResult<CopilotQueryResponseDto>> Query([FromBody] CopilotQueryRequestDto request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Question))
        {
            return BadRequest(new { message = "Câu hỏi truy vấn không được để trống." });
        }

        var response = await _copilotService.AskCopilotAsync(request, ct);
        return Ok(response);
    }
}
