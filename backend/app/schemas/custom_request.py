from typing import Optional, List
from datetime import date, datetime
from pydantic import Field, ConfigDict
from app.schemas.common import BaseSchema
from app.models.custom_request import CustomRequestStatus
from app.schemas.design import DesignRead
from app.schemas.user import UserRead
from app.schemas.measurement import MeasurementProfileRead
from app.schemas.quotation import QuotationRead

class CustomRequestImageRead(BaseSchema):
    model_config = ConfigDict(from_attributes=True)
    id: str
    file_path: str

class CustomRequestCreate(BaseSchema):
    design_id: Optional[str] = None
    garment_type: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=5)
    phone: Optional[str] = Field(None, description="Contact mobile number")
    fabric: Optional[str] = None
    preferred_color: Optional[str] = None
    occasion: Optional[str] = None
    required_date: Optional[date] = None
    measurement_profile_id: Optional[str] = None
    image_paths: Optional[List[str]] = Field(default_factory=list)

class CustomRequestStatusUpdate(BaseSchema):
    status: CustomRequestStatus
    notes: Optional[str] = None

class CustomRequestCancel(BaseSchema):
    reason: Optional[str] = None
    notes: Optional[str] = None

class CustomRequestRead(BaseSchema):
    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_id: str
    design_id: Optional[str] = None
    garment_type: str
    description: str
    contact_phone: Optional[str] = None
    fabric: Optional[str] = None
    preferred_color: Optional[str] = None
    occasion: Optional[str] = None
    required_date: Optional[date] = None
    measurement_profile_id: Optional[str] = None
    status: CustomRequestStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    customer: Optional[UserRead] = None
    design: Optional[DesignRead] = None
    measurement_profile: Optional[MeasurementProfileRead] = None
    images: List[CustomRequestImageRead] = Field(default_factory=list)
    quotations: List[QuotationRead] = Field(default_factory=list)
