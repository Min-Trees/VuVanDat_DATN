using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class RouteStopPlan : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid TripId { get; set; }
    public Trip? Trip { get; set; }
    public int SequenceOrder { get; set; }
    public string StopType { get; set; } = "Delivery"; // Pickup hoặc Delivery
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime WindowStartUtc { get; set; }
    public DateTime WindowEndUtc { get; set; }
    public DateTime EstimatedArrivalUtc { get; set; }
    public decimal DistanceKmFromPrevious { get; set; }
    public decimal EstimatedFuelLitre { get; set; }
    public bool IsViableWithRegulations { get; set; } = true;
    public string? RegulationNote { get; set; }
}
