namespace VDBus.Domain.Enums;

public enum OrderStatus
{
    Draft = 1,
    PendingDispatch = 2,
    Assigned = 3,
    DriverAccepted = 4,
    InTransitToPickup = 5,
    LoadingCargo = 6,
    InTransitDelivery = 7,
    Delivered = 8,
    PartiallyDelivered = 9,
    Reconciled = 10,
    Cancelled = 11
}
