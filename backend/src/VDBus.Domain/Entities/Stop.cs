using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class Stop : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid TripId { get; set; }
    public int StopOrder { get; set; } // Thứ tự điểm dừng: 1, 2, 3...
    public string StopType { get; set; } = "Delivery"; // Pickup, Delivery, Rest, Fuel
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime ScheduledArrivalUtc { get; set; }
    public DateTime? ActualArrivalUtc { get; set; }
    public DateTime? ActualDepartureUtc { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Skipped
    public string Notes { get; set; } = string.Empty;

    // Navigation
    public Trip? Trip { get; set; }
}
