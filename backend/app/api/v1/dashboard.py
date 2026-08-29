from datetime import date, datetime, timedelta, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.deps import get_current_active_admin
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.appointment import Appointment, AppointmentStatus
from app.models.custom_request import CustomRequest, CustomRequestStatus
from app.models.payment import Payment, PaymentStatus
from app.models.service import Service
from app.models.contact import ContactMessage
from app.schemas.dashboard import (
    AdminDashboardStats,
    DashboardAnalytics,
    MonthlyRevenue,
    StatusCount,
    CategoryStat
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/dashboard", tags=["Admin Dashboard & Analytics"])

@router.get("/stats", response_model=ApiResponse[AdminDashboardStats])
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Real-time key performance indicators calculated directly from database records."""
    today = date.today()
    start_of_month = datetime(today.year, today.month, 1, tzinfo=timezone.utc)

    # Customers
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()

    # Appointments
    todays_appointments = db.query(Appointment).filter(
        Appointment.appointment_date == today,
        Appointment.status.in_([AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING])
    ).count()

    pending_appointments = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.PENDING
    ).count()

    # Orders
    active_statuses = [
        OrderStatus.ORDER_RECEIVED,
        OrderStatus.MEASUREMENTS_CONFIRMED,
        OrderStatus.CUTTING,
        OrderStatus.STITCHING,
        OrderStatus.QUALITY_CHECK
    ]
    active_orders = db.query(Order).filter(Order.status.in_(active_statuses)).count()
    ready_orders = db.query(Order).filter(Order.status == OrderStatus.READY).count()

    # Pending Payments
    pending_payments_res = db.query(
        func.coalesce(func.sum(Order.remaining_amount), 0.0)
    ).filter(Order.status != OrderStatus.CANCELLED).scalar()
    pending_payments_amount = float(pending_payments_res or 0.0)

    # Revenue (Order value calculation ensures accurate stats even with offline/trial payments)
    paid_payments_res = db.query(
        func.coalesce(func.sum(Payment.amount), 0.0)
    ).filter(Payment.status == PaymentStatus.PAID).scalar()

    total_orders_val = db.query(
        func.coalesce(func.sum(Order.price), 0.0)
    ).filter(Order.status != OrderStatus.CANCELLED).scalar()

    total_revenue = float(paid_payments_res or 0.0)
    if total_revenue == 0.0:
        total_revenue = float(total_orders_val or 0.0)

    monthly_payments_res = db.query(
        func.coalesce(func.sum(Payment.amount), 0.0)
    ).filter(
        Payment.status == PaymentStatus.PAID,
        Payment.paid_at >= start_of_month
    ).scalar()

    monthly_orders_res = db.query(
        func.coalesce(func.sum(Order.price), 0.0)
    ).filter(
        Order.status != OrderStatus.CANCELLED,
        Order.created_at >= start_of_month
    ).scalar()

    monthly_revenue = float(monthly_payments_res or 0.0)
    if monthly_revenue == 0.0:
        monthly_revenue = float(monthly_orders_res or 0.0)

    # Custom Requests
    new_custom_requests = db.query(CustomRequest).filter(
        CustomRequest.status == CustomRequestStatus.SUBMITTED
    ).count()

    stats = AdminDashboardStats(
        total_customers=total_customers,
        todays_appointments=todays_appointments,
        pending_appointments=pending_appointments,
        active_orders=active_orders,
        ready_orders=ready_orders,
        pending_payments_amount=pending_payments_amount,
        monthly_revenue=monthly_revenue,
        total_revenue=total_revenue,
        new_custom_requests=new_custom_requests
    )
    return ApiResponse(success=True, data=stats)

@router.get("/analytics", response_model=ApiResponse[DashboardAnalytics])
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Comprehensive analytics for charts (monthly revenue trends, status distribution, service breakdown)."""
    # 1. Dashboard Stats
    stats_response = get_dashboard_stats(db=db, admin=admin)
    stats = stats_response.data

    # 2. Monthly Revenue Trend (Last 6 months)
    monthly_trends: List[MonthlyRevenue] = []
    today = date.today()
    for i in range(5, -1, -1):
        year = today.year
        month = today.month - i
        while month <= 0:
            month += 12
            year -= 1

        month_label = datetime(year, month, 1).strftime("%b %Y")
        start_dt = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            end_dt = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end_dt = datetime(year, month + 1, 1, tzinfo=timezone.utc)

        rev = db.query(func.coalesce(func.sum(Order.price), 0.0)).filter(
            Order.status != OrderStatus.CANCELLED,
            Order.created_at >= start_dt,
            Order.created_at < end_dt
        ).scalar()

        orders_cnt = db.query(Order).filter(
            Order.created_at >= start_dt,
            Order.created_at < end_dt
        ).count()

        monthly_trends.append(MonthlyRevenue(
            month=month_label,
            revenue=float(rev or 0.0),
            orders_count=orders_cnt
        ))

    # 3. Order Status Distribution
    status_counts_db = db.query(
        Order.status, func.count(Order.id)
    ).group_by(Order.status).all()

    order_status_dist = [
        StatusCount(status=st.value if hasattr(st, 'value') else str(st), count=cnt)
        for st, cnt in status_counts_db
    ]

    # 4. Orders by Service Category
    category_counts_db = db.query(
        Service.category,
        func.count(Order.id).label("cnt"),
        func.coalesce(func.sum(Order.price), 0.0).label("rev")
    ).join(Order.service).group_by(Service.category).all()

    category_stats = [
        CategoryStat(
            category=cat.value if hasattr(cat, 'value') else str(cat),
            count=cnt,
            revenue=float(rev)
        )
        for cat, cnt, rev in category_counts_db
    ]

    # 5. Recent Activities (Orders, Consultations, and Inquiries)
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(8).all()
    recent_activity = [
        {
            "id": o.id,
            "type": "ORDER",
            "title": f"Order #{o.order_number} ({o.service.name if o.service else 'Bespoke'})",
            "customer": o.customer.name if o.customer else "Customer",
            "amount": float(o.price),
            "status": o.status.value if hasattr(o.status, 'value') else str(o.status),
            "date": o.created_at.isoformat()
        }
        for o in recent_orders
    ]

    analytics = DashboardAnalytics(
        stats=stats,
        monthly_revenue_trend=monthly_trends,
        order_status_distribution=order_status_dist,
        orders_by_service_category=category_stats,
        recent_activity=recent_activity
    )
    return ApiResponse(success=True, data=analytics)
