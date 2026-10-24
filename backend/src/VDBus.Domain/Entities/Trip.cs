using System;
using System.Collections.Generic;
using VDBus.Domain.Common;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Entities;

public class Trip : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string TripCode { get; set; } = string.Empty; // Mã chuyến xe (CH-2026-0001)
    public Guid VehicleId { get; set; }
    public Guid DriverId { get; set; }
    public TripStatus Status { get; set; } = TripStatus.Scheduled;

    public DateTime? StartTimeUtc { get; set; }
    public DateTime? EndTimeUtc { get; set; }

    public decimal TotalDistanceKm { get; set; }
    public decimal EstimatedFuelLitre { get; set; }
    public decimal TotalTollAmountVnd { get; set; }

    public string Notes { get; set; } = string.Empty;

    // Navigation
    public Vehicle? Vehicle { get; set; }
    public Driver? Driver { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Stop> Stops { get; set; } = new List<Stop>();
}
