from typing import Optional
from datetime import datetime
from pydantic import Field
from app.schemas.common import BaseSchema
from app.models.payment import PaymentMethod, PaymentType, PaymentStatus
from app.schemas.user import UserRead

class PaymentCreate(BaseSchema):
    order_id: str
    amount: float = Field(..., gt=0)
    payment_type: PaymentType = PaymentType.ADVANCE
    payment_method: PaymentMethod = PaymentMethod.UPI
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None

class PaymentRead(BaseSchema):
    id: str
    order_id: str
    customer_id: str
    amount: float
    payment_type: PaymentType
    payment_method: PaymentMethod
    transaction_reference: Optional[str] = None
    status: PaymentStatus
    paid_at: datetime
    created_at: datetime

    customer: Optional[UserRead] = None
