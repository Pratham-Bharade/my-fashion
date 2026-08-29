from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import EmailStr, Field
from app.schemas.common import BaseSchema
from app.models.user import UserRole

class CustomerProfileBase(BaseSchema):
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class CustomerProfileCreate(CustomerProfileBase):
    pass

class CustomerProfileUpdate(CustomerProfileBase):
    pass

class CustomerProfileRead(CustomerProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

class UserBase(BaseSchema):
    name: str
    email: EmailStr
    phone: str
    role: UserRole = UserRole.CUSTOMER
    profile_image: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseSchema):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserRead(BaseSchema):
    id: str
    name: str
    email: EmailStr
    phone: str
    role: UserRole
    profile_image: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    profile: Optional[CustomerProfileRead] = None

class CustomerAdminRead(UserRead):
    total_orders: int = 0
    total_spent: float = 0.0
    total_appointments: int = 0
