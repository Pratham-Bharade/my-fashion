from typing import Optional, List
from datetime import datetime
from pydantic import Field
from app.schemas.common import BaseSchema

class DesignBase(BaseSchema):
    title: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    image: str
    price: Optional[float] = Field(None, ge=0)
    tags: Optional[List[str]] = []
    allow_audio: bool = True
    is_active: bool = True

class DesignCreate(DesignBase):
    pass

class DesignUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=2, max_length=150)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    tags: Optional[List[str]] = None
    allow_audio: Optional[bool] = None
    is_active: Optional[bool] = None

class DesignRead(DesignBase):
    id: str
    created_at: datetime
    updated_at: datetime
