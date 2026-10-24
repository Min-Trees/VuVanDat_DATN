using System;
using FluentAssertions;
using VDBus.Domain.Entities;
using VDBus.Domain.Enums;
using VDBus.Domain.Services;
using Xunit;

namespace VDBus.Domain.Tests;

public class OrderStateMachineTests
{
    [Fact]
    public void StandardHappyPath_ShouldSucceedThroughAllStages()
    {
        var order = new Order { Status = OrderStatus.Draft, OrderCode = "DH-2026-0001" };

        // 1. Dispatcher submits order to dispatch queue
        OrderStateMachine.Transition(order, OrderStatus.PendingDispatch, UserRole.Dispatcher);
        order.Status.Should().Be(OrderStatus.PendingDispatch);

        // 2. Dispatcher assigns vehicle & driver
        order.TripId = Guid.NewGuid();
        OrderStateMachine.Transition(order, OrderStatus.Assigned, UserRole.Dispatcher);
        order.Status.Should().Be(OrderStatus.Assigned);

        // 3. Driver accepts trip on mobile app
        OrderStateMachine.Transition(order, OrderStatus.DriverAccepted, UserRole.Driver);
        order.Status.Should().Be(OrderStatus.DriverAccepted);

        // 4. Driver heads to pickup
        OrderStateMachine.Transition(order, OrderStatus.InTransitToPickup, UserRole.Driver);
        order.Status.Should().Be(OrderStatus.InTransitToPickup);

        // 5. Driver loading cargo at warehouse
        OrderStateMachine.Transition(order, OrderStatus.LoadingCargo, UserRole.Driver);
        order.Status.Should().Be(OrderStatus.LoadingCargo);

        // 6. Driver in delivery transit
        OrderStateMachine.Transition(order, OrderStatus.InTransitDelivery, UserRole.Driver);
        order.Status.Should().Be(OrderStatus.InTransitDelivery);

        // 7. Delivered with ePOD
        OrderStateMachine.Transition(order, OrderStatus.Delivered, UserRole.Driver);
        order.Status.Should().Be(OrderStatus.Delivered);

        // 8. Accountant reconciles
        OrderStateMachine.Transition(order, OrderStatus.Reconciled, UserRole.Accountant);
        order.Status.Should().Be(OrderStatus.Reconciled);
    }

    [Fact]
    public void InvalidTransition_FromDraftDirectlyToDelivered_ShouldThrow()
    {
        var order = new Order { Status = OrderStatus.Draft };
        var act = () => OrderStateMachine.Transition(order, OrderStatus.Delivered, UserRole.Driver);
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Không thể chuyển trạng thái*");
    }

    [Fact]
    public void RoleGuard_DriverCannotReconcile_ShouldThrow()
    {
        var order = new Order { Status = OrderStatus.Delivered };
        var act = () => OrderStateMachine.Transition(order, OrderStatus.Reconciled, UserRole.Driver);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void ExceptionHandling_DriverRejection_ShouldReturnToPendingDispatchAndClearTripId()
    {
        var tripId = Guid.NewGuid();
        var order = new Order { Status = OrderStatus.Assigned, TripId = tripId };

        OrderStateMachine.Transition(order, OrderStatus.PendingDispatch, UserRole.Driver, "Xe bị hỏng lốp trước giờ khởi hành");

        order.Status.Should().Be(OrderStatus.PendingDispatch);
        order.TripId.Should().BeNull();
        order.RejectionReason.Should().Be("Xe bị hỏng lốp trước giờ khởi hành");
    }

    [Fact]
    public void ExceptionHandling_DriverRejectionWithoutReason_ShouldThrow()
    {
        var order = new Order { Status = OrderStatus.Assigned, TripId = Guid.NewGuid() };
        var act = () => OrderStateMachine.Transition(order, OrderStatus.PendingDispatch, UserRole.Driver, " ");
        act.Should().Throw<InvalidOperationException>().WithMessage("*lý do từ chối*");
    }

    [Fact]
    public void ExceptionHandling_VehicleBreakdownMidway_AllowsReassigning()
    {
        var order = new Order { Status = OrderStatus.InTransitDelivery, TripId = Guid.NewGuid() };
        
        OrderStateMachine.Transition(order, OrderStatus.Assigned, UserRole.Dispatcher, "Xe gặp sự cố động cơ tại QL1A Km45");
        
        order.Status.Should().Be(OrderStatus.Assigned);
        order.Notes.Should().Contain("Đổi xe do sự cố");
    }

    [Fact]
    public void ExceptionHandling_PartialDelivery_RequiresNote()
    {
        var order = new Order { Status = OrderStatus.InTransitDelivery };

        var act = () => OrderStateMachine.Transition(order, OrderStatus.PartiallyDelivered, UserRole.Driver, null);
        act.Should().Throw<InvalidOperationException>().WithMessage("*giao một phần*");

        OrderStateMachine.Transition(order, OrderStatus.PartiallyDelivered, UserRole.Driver, "Hỏng 2 thùng do ẩm ướt trong lúc vận chuyển");
        order.Status.Should().Be(OrderStatus.PartiallyDelivered);
        order.PartialDeliveryNote.Should().Be("Hỏng 2 thùng do ẩm ướt trong lúc vận chuyển");
    }

    [Fact]
    public void Cancellation_FromPendingDispatch_RequiresReason()
    {
        var order = new Order { Status = OrderStatus.PendingDispatch };

        var act = () => OrderStateMachine.Transition(order, OrderStatus.Cancelled, UserRole.Dispatcher, "");
        act.Should().Throw<InvalidOperationException>().WithMessage("*lý do hủy*");

        OrderStateMachine.Transition(order, OrderStatus.Cancelled, UserRole.Dispatcher, "Chủ hàng yêu cầu hủy vì thay đổi kế hoạch sản xuất");
        order.Status.Should().Be(OrderStatus.Cancelled);
        order.CancellationReason.Should().Be("Chủ hàng yêu cầu hủy vì thay đổi kế hoạch sản xuất");
    }
}
