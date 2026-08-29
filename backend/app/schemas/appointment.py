from typing import Optional
from datetime import date, time, datetime
from pydantic import Field, ConfigDict
from app.schemas.common import BaseSchema
from app.models.appointment import AppointmentStatus
from app.schemas.service import ServiceRead
from app.schemas.user import UserRead
from app.schemas.measurement import MeasurementProfileRead

class AvailableSlot(BaseSchema):
    date: date
    start_time: str
    end_time: str
    is_available: bool

class AppointmentBase(BaseSchema):
    service_id: str
    measurement_profile_id: Optional[str] = None
    appointment_date: date
    start_time: time
    end_time: time
    phone: Optional[str] = None
    notes: Optional[str] = None
    reference_image: Optional[str] = None

class AppointmentCreate(BaseSchema):
    service_id: str
    measurement_profile_id: Optional[str] = None
    appointment_date: date
    start_time: str  # Format: "HH:MM" or "HH:MM AM/PM"
    phone: Optional[str] = Field(None, description="Contact mobile number")
    notes: Optional[str] = None
    reference_image: Optional[str] = None

class AppointmentStatusUpdate(BaseSchema):
    status: AppointmentStatus
    notes: Optional[str] = None

class AppointmentReschedule(BaseSchema):
    appointment_date: date
    start_time: str  # Format: "HH:MM" or "HH:MM AM/PM"
    notes: Optional[str] = None

class AppointmentRead(BaseSchema):
    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_id: str
    service_id: str
    measurement_profile_id: Optional[str] = None
    appointment_date: date
    start_time: time
    end_time: time
    status: AppointmentStatus
    contact_phone: Optional[str] = None
    notes: Optional[str] = None
    reference_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    customer: Optional[UserRead] = None
    service: Optional[ServiceRead] = None
    measurement_profile: Optional[MeasurementProfileRead] = None
