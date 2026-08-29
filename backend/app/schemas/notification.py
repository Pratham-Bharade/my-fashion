from typing import Optional, List
from datetime import datetime
from pydantic import Field, ConfigDict
from app.schemas.common import BaseSchema
from app.models.notification import NotificationType

class NotificationCreate(BaseSchema):
    user_id: str
    title: str
    message: str
    type: NotificationType = NotificationType.GENERAL
    link_url: Optional[str] = None

class AdminSendNotification(BaseSchema):
    user_id: Optional[str] = None  # None or "ALL" means broadcast to all customers
    title: str = Field(..., min_length=2, max_length=150)
    message: str = Field(..., min_length=2)
    type: NotificationType = NotificationType.GENERAL
    link_url: Optional[str] = None

class NotificationRead(BaseSchema):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    message: str
    type: NotificationType
    is_read: bool
    link_url: Optional[str] = None
    created_at: datetime

class NotificationListResponse(BaseSchema):
    unread_count: int
    notifications: List[NotificationRead]
