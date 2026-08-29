from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_current_active_admin
from app.models.order import Order, OrderStatus, OrderStatusHistory
from app.models.user import User, UserRole
from app.models.payment import Payment
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderRead, OrderCancel
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.services.order_service import order_service
from app.services.notification_service import notification_service
from app.models.notification import NotificationType
from app.core.exceptions import NotFoundException, ForbiddenException, AppException

router = APIRouter(prefix="/orders", tags=["Tailoring Orders & Production Line"])

@router.get("/my", response_model=ApiResponse[List[OrderRead]])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer: Get personal tailoring orders and real-time production tracking."""
    orders = db.query(Order).filter(
        Order.customer_id == current_user.id
    ).order_by(Order.updated_at.desc()).all()
    return ApiResponse(success=True, data=orders)

@router.get("", response_model=PaginatedResponse[OrderRead])
def list_orders(
    status_filter: Optional[OrderStatus] = Query(None, alias="status"),
    search: Optional[str] = None,
    customer_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Search and filter all customer orders across production milestones."""
    query = db.query(Order)

    if status_filter:
        query = query.filter(Order.status == status_filter)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    if search:
        s = f"%{search.strip()}%"
        query = query.join(Order.customer).filter(
            (Order.order_number.ilike(s)) | (User.name.ilike(s)) | (User.phone.ilike(s))
        )

    total = query.count()
    offset = (page - 1) * limit
    orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        items=orders,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{id}", response_model=ApiResponse[OrderRead])
def get_order(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full details of a tailoring order with milestone history."""
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise NotFoundException("Order")

    if current_user.role != UserRole.ADMIN and order.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to view this order.")

    return ApiResponse(success=True, data=order)

@router.post("", response_model=ApiResponse[OrderRead], status_code=status.HTTP_201_CREATED)
def create_order_admin(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Directly create and register a new tailoring production order."""
    order_num = order_service.generate_order_number(db)
    rem_amt = max(0.0, payload.price - payload.advance_amount)

    order = Order(
        order_number=order_num,
        customer_id=payload.customer_id,
        service_id=payload.service_id,
        design_id=payload.design_id,
        measurement_profile_id=payload.measurement_profile_id,
        custom_request_id=payload.custom_request_id,
        price=payload.price,
        advance_amount=payload.advance_amount,
        remaining_amount=rem_amt,
        expected_delivery_date=payload.expected_delivery_date,
        status=OrderStatus.ORDER_RECEIVED,
        notes=payload.notes
    )
    db.add(order)
    db.flush()

    history = OrderStatusHistory(
        order_id=order.id,
        status=OrderStatus.ORDER_RECEIVED,
        notes="Order created by atelier admin.",
        changed_by=admin.id
    )
    db.add(history)
    db.commit()
    db.refresh(order)
    return ApiResponse(success=True, message=f"Order {order.order_number} created successfully.", data=order)

@router.patch("/{id}/status", response_model=ApiResponse[OrderRead])
def update_order_status(
    id: str,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Advance order status through production stages (Cutting, Stitching, Quality Check, Ready, Delivered)."""
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise NotFoundException("Order")

    order = order_service.update_order_status(
        db=db,
        order=order,
        new_status=payload.status,
        notes=payload.notes,
        changed_by_user_id=admin.id
    )
    db.commit()
    db.refresh(order)
    return ApiResponse(success=True, message=f"Order status updated to {payload.status.value}.", data=order)

@router.patch("/{id}/cancel", response_model=ApiResponse[OrderRead])
def cancel_order(
    id: str,
    payload: Optional[OrderCancel] = None,
    reason: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer or Admin: Cancel a tailoring order and preserve it in Cancelled Archive."""
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise NotFoundException("Order")

    if current_user.role != UserRole.ADMIN and order.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to cancel this order.")

    cancel_reason = None
    if payload:
        cancel_reason = payload.reason or payload.notes
    if not cancel_reason:
        cancel_reason = reason or "Cancelled by user"

    order = order_service.update_order_status(
        db=db,
        order=order,
        new_status=OrderStatus.CANCELLED,
        notes=f"Cancellation Reason: {cancel_reason}",
        changed_by_user_id=current_user.id
    )
    db.commit()
    db.refresh(order)

    # If customer cancelled, notify all admins
    if current_user.role == UserRole.CUSTOMER:
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for adm in admins:
            notification_service.create_notification(
                db=db,
                user_id=adm.id,
                title="Stitching Order Cancelled by Customer",
                message=f"Customer {current_user.name} ({current_user.phone or 'No phone'}) cancelled Order #{order.order_number}. Reason: {cancel_reason}",
                type=NotificationType.GENERAL,
                link_url="/admin/orders"
            )

    return ApiResponse(success=True, message=f"Order #{order.order_number} cancelled and saved in Cancelled Items.", data=order)

@router.delete("/{id}", response_model=MessageResponse)
def delete_order(
    id: str,
    reason: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin or Customer: Permanently delete a tailoring order record with cancellation reason."""
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise NotFoundException("Order")

    if current_user.role != UserRole.ADMIN and order.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to delete this order.")

    order_num = order.order_number

    # Notify admins if customer cancelled
    if current_user.role == UserRole.CUSTOMER:
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for adm in admins:
            notification_service.create_notification(
                db=db,
                user_id=adm.id,
                title="Stitching Order Cancelled by Customer",
                message=f"Customer {current_user.name} ({current_user.phone or 'No phone'}) cancelled Order #{order_num}. Reason: {reason or 'No reason provided'}",
                type=NotificationType.GENERAL,
                link_url="/admin/orders"
            )

    # Delete associated status history and payments
    db.query(OrderStatusHistory).filter(OrderStatusHistory.order_id == id).delete(synchronize_session=False)
    db.query(Payment).filter(Payment.order_id == id).delete(synchronize_session=False)

    db.delete(order)
    db.commit()
    return MessageResponse(success=True, message=f"Order #{order_num} deleted successfully.")
