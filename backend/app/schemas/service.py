from typing import Optional
from datetime import datetime
from pydantic import Field
from app.schemas.common import BaseSchema

class ServiceBase(BaseSchema):
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    estimated_days: int = Field(5, ge=1)
    image: Optional[str] = None
    allow_audio: bool = True
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    estimated_days: Optional[int] = Field(None, ge=1)
    image: Optional[str] = None
    allow_audio: Optional[bool] = None
    is_active: Optional[bool] = None

class ServiceRead(ServiceBase):
    id: str
    created_at: datetime
    updated_at: datetime
