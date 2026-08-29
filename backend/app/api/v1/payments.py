from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_current_active_admin
from app.models.payment import Payment, PaymentMethod, PaymentType, PaymentStatus
from app.models.order import Order
from app.models.user import User, UserRole
from app.schemas.payment import PaymentCreate, PaymentRead
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.services.notification_service import notification_service
from app.models.notification import NotificationType
from app.core.exceptions import NotFoundException, ForbiddenException, AppException

router = APIRouter(prefix="/payments", tags=["Payments & Receipts"])

@router.get("/my", response_model=ApiResponse[List[PaymentRead]])
def get_my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer: View payment receipts history."""
    payments = db.query(Payment).filter(
        Payment.customer_id == current_user.id
    ).order_by(Payment.paid_at.desc()).all()
    return ApiResponse(success=True, data=payments)

@router.get("", response_model=PaginatedResponse[PaymentRead])
def list_payments(
    order_id: Optional[str] = None,
    customer_id: Optional[str] = None,
    payment_method: Optional[PaymentMethod] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Filter and search all boutique transaction records."""
    query = db.query(Payment)

    if order_id:
        query = query.filter(Payment.order_id == order_id)
    if customer_id:
        query = query.filter(Payment.customer_id == customer_id)
    if payment_method:
        query = query.filter(Payment.payment_method == payment_method)

    total = query.count()
    offset = (page - 1) * limit
    payments = query.order_by(Payment.paid_at.desc()).offset(offset).limit(limit).all()
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        items=payments,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.post("", response_model=ApiResponse[PaymentRead], status_code=status.HTTP_201_CREATED)
def record_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Record payment receipt (Cash / UPI / Online) and update order remaining balance."""
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise NotFoundException("Order")

    if payload.amount <= 0:
        raise AppException(status_code=400, message="Payment amount must be greater than zero.")

    # Check if payment exceeds remaining balance
    if payload.amount > float(order.remaining_amount) + 0.01:
        raise AppException(
            status_code=400,
            message=f"Payment of ₹{payload.amount:,.2f} exceeds outstanding order balance of ₹{order.remaining_amount:,.2f}."
        )

    payment = Payment(
        order_id=order.id,
        customer_id=order.customer_id,
        amount=payload.amount,
        payment_type=payload.payment_type,
        payment_method=payload.payment_method,
        transaction_reference=payload.transaction_reference,
        status=PaymentStatus.PAID,
        paid_at=datetime.now(timezone.utc)
    )
    db.add(payment)

    # Recalculate order advance and remaining balance
    order.remaining_amount = max(0.0, float(order.remaining_amount) - payload.amount)
    if payload.payment_type == PaymentType.ADVANCE:
        order.advance_amount = float(order.advance_amount) + payload.amount

    db.commit()
    db.refresh(payment)

    # Notify customer of payment receipt
    notification_service.create_notification(
        db=db,
        user_id=order.customer_id,
        title="Payment Received",
        message=f"Payment of ₹{payload.amount:,.2f} via {payload.payment_method.value} for order {order.order_number} has been recorded.",
        type=NotificationType.PAYMENT_RECORDED,
        link_url=f"/orders/{order.id}"
    )

    return ApiResponse(
        success=True,
        message=f"Payment of ₹{payload.amount:,.2f} recorded successfully.",
        data=payment
    )
