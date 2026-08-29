from typing import Optional
from datetime import datetime
from pydantic import EmailStr, Field
from app.schemas.common import BaseSchema
from app.models.contact import MessageStatus

class ContactMessageCreate(BaseSchema):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    message: str = Field(..., min_length=5, max_length=2000)

class ContactMessageStatusUpdate(BaseSchema):
    status: MessageStatus

class ContactMessageRead(BaseSchema):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    status: MessageStatus
    created_at: datetime
