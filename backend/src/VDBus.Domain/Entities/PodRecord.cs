using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class PodRecord : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid OrderId { get; set; }
    public Guid? TripId { get; set; }

    public string RecipientName { get; set; } = string.Empty; // Người ký nhận hàng
    public string RecipientPhone { get; set; } = string.Empty;
    public string SignatureBase64 { get; set; } = string.Empty; // Dữ liệu nét ký số
    public string? PhotoUrl { get; set; } // Ảnh chụp hiện trường bàn giao hàng

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    // Chuỗi băm SHA-256 bảo mật xác thực tính toàn vẹn (OrderId + Timestamp + Recipient + Coords + Signature)
    public string HashSha256 { get; set; } = string.Empty;
    public bool IsVerified { get; set; } = true;
    public string Notes { get; set; } = string.Empty;

    // Navigation
    public Order? Order { get; set; }
}
