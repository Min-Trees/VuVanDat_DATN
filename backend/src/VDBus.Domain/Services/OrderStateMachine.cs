using System;
using System.Collections.Generic;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;

namespace VDBus.Domain.Services;

public class OrderStateMachine
{
    private static readonly Dictionary<OrderStatus, HashSet<OrderStatus>> AllowedTransitions = new()
    {
        { OrderStatus.Draft, new HashSet<OrderStatus> { OrderStatus.PendingDispatch, OrderStatus.Cancelled } },
        { OrderStatus.PendingDispatch, new HashSet<OrderStatus> { OrderStatus.Assigned, OrderStatus.Cancelled } },
        { OrderStatus.Assigned, new HashSet<OrderStatus> { OrderStatus.DriverAccepted, OrderStatus.PendingDispatch, OrderStatus.Cancelled } },
        { OrderStatus.DriverAccepted, new HashSet<OrderStatus> { OrderStatus.InTransitToPickup, OrderStatus.Cancelled } },
        { OrderStatus.InTransitToPickup, new HashSet<OrderStatus> { OrderStatus.LoadingCargo, OrderStatus.Assigned, OrderStatus.Cancelled } },
        { OrderStatus.LoadingCargo, new HashSet<OrderStatus> { OrderStatus.InTransitDelivery } },
        { OrderStatus.InTransitDelivery, new HashSet<OrderStatus> { OrderStatus.Delivered, OrderStatus.PartiallyDelivered, OrderStatus.Assigned } },
        { OrderStatus.Delivered, new HashSet<OrderStatus> { OrderStatus.Reconciled } },
        { OrderStatus.PartiallyDelivered, new HashSet<OrderStatus> { OrderStatus.Reconciled } },
        { OrderStatus.Cancelled, new HashSet<OrderStatus>() },
        { OrderStatus.Reconciled, new HashSet<OrderStatus>() },
    };

    public static bool CanTransition(OrderStatus currentStatus, OrderStatus targetStatus, UserRole actorRole)
    {
        // Kiểm tra transition hợp lệ về mặt luồng
        if (!AllowedTransitions.TryGetValue(currentStatus, out var validTargets) || !validTargets.Contains(targetStatus))
        {
            return false;
        }

        // Kiểm tra thẩm quyền vai trò (Role-based transition guard)
        return targetStatus switch
        {
            OrderStatus.PendingDispatch => actorRole is UserRole.Admin or UserRole.Dispatcher or UserRole.Shipper ||
                                           (currentStatus == OrderStatus.Assigned && actorRole == UserRole.Driver),
            OrderStatus.Assigned => actorRole is UserRole.Admin or UserRole.Dispatcher,
            OrderStatus.DriverAccepted => actorRole is UserRole.Driver,
            OrderStatus.InTransitToPickup => actorRole is UserRole.Driver,
            OrderStatus.LoadingCargo => actorRole is UserRole.Driver,
            OrderStatus.InTransitDelivery => actorRole is UserRole.Driver or UserRole.Dispatcher,
            OrderStatus.Delivered => actorRole is UserRole.Driver,
            OrderStatus.PartiallyDelivered => actorRole is UserRole.Driver or UserRole.Dispatcher,
            OrderStatus.Reconciled => actorRole is UserRole.Admin or UserRole.Accountant,
            OrderStatus.Cancelled => actorRole is UserRole.Admin or UserRole.Dispatcher,
            _ => false
        };
    }

    public static void Transition(Order order, OrderStatus newStatus, UserRole actorRole, string? reason = null)
    {
        if (order == null) throw new ArgumentNullException(nameof(order));

        if (!CanTransition(order.Status, newStatus, actorRole))
        {
            throw new InvalidOperationException(
                $"Không thể chuyển trạng thái đơn hàng từ '{order.Status}' sang '{newStatus}' bởi vai trò '{actorRole}'.");
        }

        // Xử lý các tình huống ngoại lệ nghiệp vụ cụ thể
        if (newStatus == OrderStatus.Cancelled)
        {
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new InvalidOperationException("Bắt buộc phải cung cấp lý do hủy đơn hàng.");
            }
            order.CancellationReason = reason;
        }

        // Tài xế từ chối chuyến xe (Assigned -> PendingDispatch)
        if (order.Status == OrderStatus.Assigned && newStatus == OrderStatus.PendingDispatch)
        {
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new InvalidOperationException("Bắt buộc phải cung cấp lý do từ chối nhận chuyến xe.");
            }
            order.RejectionReason = reason;
            order.TripId = null; // Gỡ liên kết chuyến để quay về hàng đợi điều xe
        }

        // Đổi xe giữa đường do sự cố (InTransit* -> Assigned)
        if ((order.Status is OrderStatus.InTransitToPickup or OrderStatus.InTransitDelivery) && newStatus == OrderStatus.Assigned)
        {
            order.Notes += $"; Đổi xe do sự cố lúc {DateTime.UtcNow:yyyy-MM-dd HH:mm}: {reason ?? "Xe gặp sự cố kỹ thuật"}";
        }

        // Giao một phần
        if (newStatus == OrderStatus.PartiallyDelivered)
        {
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new InvalidOperationException("Bắt buộc phải ghi nhận lý do giao một phần và biên bản thừa thiếu hàng.");
            }
            order.PartialDeliveryNote = reason;
        }

        order.Status = newStatus;
        order.UpdatedAtUtc = DateTime.UtcNow;
    }
}
