from typing import Optional
from datetime import date, datetime
from pydantic import Field
from app.schemas.common import BaseSchema
from app.models.quotation import QuotationStatus
from app.schemas.user import UserRead

class QuotationCreate(BaseSchema):
    custom_request_id: str
    base_price: float = Field(..., gt=0)
    additional_charges: float = Field(0.0, ge=0)
    discount: float = Field(0.0, ge=0)
    advance_amount: float = Field(0.0, ge=0)
    valid_until: date
    notes: Optional[str] = None

class QuotationRespond(BaseSchema):
    accept: bool
    notes: Optional[str] = None

class QuotationMessageCreate(BaseSchema):
    message: str = Field(..., min_length=2)

class QuotationCustomRequestRead(BaseSchema):
    id: str
    garment_type: str
    description: Optional[str] = None
    fabric: Optional[str] = None
    preferred_color: Optional[str] = None
    contact_phone: Optional[str] = None
    customer: Optional[UserRead] = None

class QuotationRead(BaseSchema):
    id: str
    custom_request_id: str
    customer_id: str
    base_price: float
    additional_charges: float
    discount: float
    final_amount: float
    advance_amount: float
    valid_until: date
    status: QuotationStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    customer: Optional[UserRead] = None
    custom_request: Optional[QuotationCustomRequestRead] = None
