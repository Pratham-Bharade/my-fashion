from typing import List, Dict, Any
from app.schemas.common import BaseSchema

class StatusCount(BaseSchema):
    status: str
    count: int

class MonthlyRevenue(BaseSchema):
    month: str # e.g. "Jan", "Feb" or "2026-08"
    revenue: float
    orders_count: int

class CategoryStat(BaseSchema):
    category: str
    count: int
    revenue: float

class AdminDashboardStats(BaseSchema):
    total_customers: int
    todays_appointments: int
    pending_appointments: int
    active_orders: int
    ready_orders: int
    pending_payments_amount: float
    monthly_revenue: float
    total_revenue: float
    new_custom_requests: int

class DashboardAnalytics(BaseSchema):
    stats: AdminDashboardStats
    monthly_revenue_trend: List[MonthlyRevenue]
    order_status_distribution: List[StatusCount]
    orders_by_service_category: List[CategoryStat]
    recent_activity: List[Dict[str, Any]]
