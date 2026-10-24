using System;
using System.Collections.Generic;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class Driver : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty; // Số GPLX
    public string LicenseClass { get; set; } = "C"; // B2, C, D, E, FC
    public DateTime LicenseExpiryDate { get; set; }
    public string Status { get; set; } = "Available"; // Available, OnTrip, OffDuty, Inactive
    public Guid? AssignedVehicleId { get; set; }
    public bool IsSimulated { get; set; } = false;

    // Navigation
    public Vehicle? AssignedVehicle { get; set; }
    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
}
