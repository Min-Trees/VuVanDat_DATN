using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Copilot;

namespace VDBus.Application.Common.Interfaces;

public interface IAiCopilotService
{
    Task<CopilotQueryResponseDto> AskCopilotAsync(CopilotQueryRequestDto request, CancellationToken ct = default);
}
