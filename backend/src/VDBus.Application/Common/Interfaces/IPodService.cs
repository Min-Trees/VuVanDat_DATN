using System;
using System.Threading;
using System.Threading.Tasks;
using VDBus.Application.DTOs.Pod;
using VDBus.Domain.Entities;

namespace VDBus.Application.Common.Interfaces;

public interface IPodService
{
    Task<PodRecord> SubmitPodAsync(PodSubmissionDto request, CancellationToken ct = default);
    Task<PodVerificationDto> VerifyPodIntegrityAsync(Guid orderId, CancellationToken ct = default);
    string ComputePodHash(Guid orderId, DateTime timestampUtc, string recipientName, double lat, double lon, string signatureBase64);
}
