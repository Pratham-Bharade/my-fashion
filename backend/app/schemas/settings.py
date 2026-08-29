from typing import Optional, Dict, List, Any
from datetime import datetime
from pydantic import EmailStr, Field
from app.schemas.common import BaseSchema

class BusinessSettingsBase(BaseSchema):
    business_name: str = Field(..., min_length=2, max_length=150)
    logo: Optional[str] = None
    phone: str = Field(..., min_length=5, max_length=30)
    email: EmailStr
    address: str = Field(..., min_length=5)
    whatsapp: Optional[str] = None
    working_hours: Dict[str, Any] = {
        "monday": {"open": "10:00", "close": "20:00", "is_closed": False},
        "tuesday": {"open": "10:00", "close": "20:00", "is_closed": False},
        "wednesday": {"open": "10:00", "close": "20:00", "is_closed": False},
        "thursday": {"open": "10:00", "close": "20:00", "is_closed": False},
        "friday": {"open": "10:00", "close": "20:00", "is_closed": False},
        "saturday": {"open": "10:00", "close": "20:00", "is_closed": False},
        "sunday": {"open": "11:00", "close": "17:00", "is_closed": True}
    }
    holidays: List[str] = []
    social_links: Dict[str, str] = {
        "instagram": "",
        "facebook": "",
        "youtube": "",
        "pinterest": ""
    }
    about_text: Optional[str] = None

class BusinessSettingsUpdate(BaseSchema):
    business_name: Optional[str] = None
    logo: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    whatsapp: Optional[str] = None
    working_hours: Optional[Dict[str, Any]] = None
    holidays: Optional[List[str]] = None
    social_links: Optional[Dict[str, str]] = None
    about_text: Optional[str] = None

class BusinessSettingsRead(BusinessSettingsBase):
    id: str
    updated_at: datetime
