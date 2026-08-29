from typing import Optional
from datetime import datetime
from pydantic import Field
from app.schemas.common import BaseSchema
from app.models.review import ReviewStatus
from app.schemas.user import UserRead

class ReviewCreate(BaseSchema):
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=5, max_length=1000)

class ReviewStatusUpdate(BaseSchema):
    status: ReviewStatus

class ReviewRead(BaseSchema):
    id: str
    customer_id: str
    order_id: str
    rating: int
    comment: str
    status: ReviewStatus
    created_at: datetime
    updated_at: datetime

    customer: Optional[UserRead] = None
