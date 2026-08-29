from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import Field
from app.schemas.common import BaseSchema
from app.models.measurement import GarmentType

class MeasurementProfileBase(BaseSchema):
    name: str = Field(..., min_length=2, max_length=100)
    garment_type: GarmentType
    measurements: Dict[str, Any]
    is_default: bool = False

class MeasurementProfileCreate(MeasurementProfileBase):
    pass

class MeasurementProfileUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    garment_type: Optional[GarmentType] = None
    measurements: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = None

class MeasurementProfileRead(MeasurementProfileBase):
    id: str
    customer_id: str
    created_at: datetime
    updated_at: datetime
