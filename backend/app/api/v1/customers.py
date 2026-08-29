from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.deps import get_current_active_admin
from app.models.user import User, UserRole, CustomerProfile
from app.models.order import Order
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.models.measurement import MeasurementProfile
from app.schemas.user import UserRead, CustomerAdminRead
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/customers", tags=["Customer Management (Admin)"])

@router.get("", response_model=PaginatedResponse[CustomerAdminRead])
def list_customers(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: List all customers with search and spend aggregates."""
    query = db.query(User).filter(User.role == UserRole.CUSTOMER)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (User.name.ilike(s)) | (User.email.ilike(s)) | (User.phone.ilike(s))
        )

    total = query.count()
    offset = (page - 1) * limit
    users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()

    items: List[CustomerAdminRead] = []
    for u in users:
        order_stats = db.query(
            func.count(Order.id).label("total_orders"),
            func.coalesce(func.sum(Order.price), 0.0).label("total_spent")
        ).filter(Order.customer_id == u.id).first()

        apt_count = db.query(Appointment).filter(Appointment.customer_id == u.id).count()

        customer_read = CustomerAdminRead.model_validate(u)
        customer_read.total_orders = order_stats.total_orders if order_stats else 0
        customer_read.total_spent = float(order_stats.total_spent) if order_stats else 0.0
        customer_read.total_appointments = apt_count
        items.append(customer_read)

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{id}", response_model=ApiResponse[Dict[str, Any]])
def get_customer_details(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Comprehensive view of customer profile, measurements, orders, and appointments."""
    user = db.query(User).filter(User.id == id, User.role == UserRole.CUSTOMER).first()
    if not user:
        raise NotFoundException("Customer")

    measurements = db.query(MeasurementProfile).filter(MeasurementProfile.customer_id == id).all()
    appointments = db.query(Appointment).filter(Appointment.customer_id == id).order_by(Appointment.appointment_date.desc()).all()
    orders = db.query(Order).filter(Order.customer_id == id).order_by(Order.created_at.desc()).all()
    payments = db.query(Payment).filter(Payment.customer_id == id).order_by(Payment.paid_at.desc()).all()

    data = {
        "user": UserRead.model_validate(user),
        "measurements_count": len(measurements),
        "appointments_count": len(appointments),
        "orders_count": len(orders),
        "total_spent": sum(float(o.price) for o in orders),
        "measurements": measurements,
        "recent_orders": orders[:5],
        "recent_appointments": appointments[:5],
        "recent_payments": payments[:5]
    }
    return ApiResponse(success=True, data=data)

@router.patch("/{id}/toggle-status", response_model=MessageResponse)
def toggle_customer_status(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Activate or deactivate customer account."""
    user = db.query(User).filter(User.id == id, User.role == UserRole.CUSTOMER).first()
    if not user:
        raise NotFoundException("Customer")

    user.is_active = not user.is_active
    db.commit()
    status_str = "activated" if user.is_active else "deactivated"
    return MessageResponse(success=True, message=f"Customer account {status_str} successfully.")

@router.delete("/{id}", response_model=MessageResponse)
def delete_customer(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Permanently delete a customer and all their associated records."""
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise NotFoundException("Customer")

    if user.role == UserRole.ADMIN:
        raise ForbiddenException("Admin account cannot be deleted.")

    customer_name = user.name

    # Delete any related payments first
    db.query(Payment).filter(Payment.customer_id == id).delete(synchronize_session=False)

    db.delete(user)
    db.commit()
    return MessageResponse(success=True, message=f"Customer '{customer_name}' has been permanently deleted.")
