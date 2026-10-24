using System;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.AxleLoad;

namespace VDBus.Application.Common.Interfaces;

public interface IAxleLoadService
{
    Task<AxleLoadResultDto> CalculateAxleLoadAsync(AxleLoadCalculationRequestDto request, CancellationToken ct = default);
}
