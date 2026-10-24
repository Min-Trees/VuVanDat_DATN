using System;

namespace VDBus.Application.DTOs.Pod;

public class PodSubmissionDto
{
    public Guid OrderId { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string SignatureBase64 { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class PodVerificationDto
{
    public Guid OrderId { get; set; }
    public Guid PodId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public DateTime TimestampUtc { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string StoredHashSha256 { get; set; } = string.Empty;
    public string CalculatedHashSha256 { get; set; } = string.Empty;
    public bool IsTamperFree { get; set; } // true nếu mã hash khớp tuyệt đối
    public string StatusText => IsTamperFree ? "Chung tu xac thuc toan ven" : "Canh bao: Du lieu da bi chinh sua";
}
