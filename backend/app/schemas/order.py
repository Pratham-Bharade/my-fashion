from typing import Optional, List
from datetime import date, datetime
from pydantic import Field
from app.schemas.common import BaseSchema
from app.models.order import OrderStatus
from app.schemas.user import UserRead
from app.schemas.service import ServiceRead
from app.schemas.design import DesignRead
from app.schemas.measurement import MeasurementProfileRead

class OrderStatusHistoryRead(BaseSchema):
    id: str
    order_id: str
    status: OrderStatus
    notes: Optional[str] = None
    changed_by: Optional[str] = None
    created_at: datetime
    actor: Optional[UserRead] = None

class OrderCreate(BaseSchema):
    customer_id: str
    service_id: Optional[str] = None
    design_id: Optional[str] = None
    measurement_profile_id: Optional[str] = None
    custom_request_id: Optional[str] = None
    price: float = Field(..., gt=0)
    advance_amount: float = Field(0.0, ge=0)
    expected_delivery_date: Optional[date] = None
    notes: Optional[str] = None

class OrderStatusUpdate(BaseSchema):
    status: OrderStatus
    notes: Optional[str] = None

class OrderCancel(BaseSchema):
    reason: Optional[str] = None
    notes: Optional[str] = None

OrderAdminCreate = OrderCreate

class OrderRead(BaseSchema):
    id: str
    order_number: str
    customer_id: str
    service_id: Optional[str] = None
    design_id: Optional[str] = None
    measurement_profile_id: Optional[str] = None
    custom_request_id: Optional[str] = None
    price: float
    advance_amount: float
    remaining_amount: float
    expected_delivery_date: Optional[date] = None
    status: OrderStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    customer: Optional[UserRead] = None
    service: Optional[ServiceRead] = None
    design: Optional[DesignRead] = None
    measurement_profile: Optional[MeasurementProfileRead] = None
    status_history: List[OrderStatusHistoryRead] = []
