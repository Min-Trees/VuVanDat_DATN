using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.AxleLoad;

namespace VDBus.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class AxleLoadController : ControllerBase
{
    private readonly IAxleLoadService _axleLoadService;

    public AxleLoadController(IAxleLoadService axleLoadService)
    {
        _axleLoadService = axleLoadService;
    }

    [HttpPost("calculate")]
    public async Task<ActionResult<AxleLoadResultDto>> CalculateAxleLoad(
        [FromBody] AxleLoadCalculationRequestDto request,
        CancellationToken ct)
    {
        var result = await _axleLoadService.CalculateAxleLoadAsync(request, ct);
        return Ok(result);
    }
}
