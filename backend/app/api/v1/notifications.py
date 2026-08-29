from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_current_active_admin
from app.models.notification import Notification, NotificationType
from app.models.user import User, UserRole
from app.schemas.notification import NotificationRead, NotificationListResponse, AdminSendNotification
from app.schemas.common import ApiResponse, MessageResponse
from app.core.exceptions import NotFoundException, ForbiddenException
from app.services.notification_service import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=ApiResponse[NotificationListResponse])
def list_notifications(
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve authenticated user's notifications with unread count."""
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(limit).all()

    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    validated_items = [NotificationRead.model_validate(n) for n in notifications]

    return ApiResponse(
        success=True,
        data=NotificationListResponse(
            unread_count=unread_count,
            notifications=validated_items
        )
    )

@router.post("/send", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def admin_send_notification(
    payload: AdminSendNotification,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Send a notification to a specific customer or broadcast to all registered customers."""
    if payload.user_id and payload.user_id != "ALL":
        target_user = db.query(User).filter(User.id == payload.user_id).first()
        if not target_user:
            raise NotFoundException("Customer")
        
        notification_service.create_notification(
            db=db,
            user_id=target_user.id,
            title=payload.title,
            message=payload.message,
            type=payload.type,
            link_url=payload.link_url
        )
        return MessageResponse(success=True, message=f"Notification sent to {target_user.name}.")
    else:
        # Broadcast to all customers
        customers = db.query(User).filter(User.role == UserRole.CUSTOMER).all()
        for cust in customers:
            notification_service.create_notification(
                db=db,
                user_id=cust.id,
                title=payload.title,
                message=payload.message,
                type=payload.type,
                link_url=payload.link_url
            )
        return MessageResponse(success=True, message=f"Broadcast notification sent to {len(customers)} customers.")

@router.patch("/{id}/read", response_model=MessageResponse)
def mark_notification_read(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark single notification as read."""
    notif = db.query(Notification).filter(Notification.id == id).first()
    if not notif:
        raise NotFoundException("Notification")

    if notif.user_id != current_user.id:
        raise ForbiddenException("You cannot alter another user's notification.")

    notif.is_read = True
    db.commit()
    return MessageResponse(success=True, message="Notification marked as read.")

@router.patch("/read-all", response_model=MessageResponse)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for current user."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return MessageResponse(success=True, message="All notifications marked as read.")

@router.delete("/{id}", response_model=MessageResponse)
def delete_notification(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a single notification."""
    notif = db.query(Notification).filter(Notification.id == id).first()
    if not notif:
        raise NotFoundException("Notification")

    if notif.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise ForbiddenException("You cannot delete another user's notification.")

    db.delete(notif)
    db.commit()
    return MessageResponse(success=True, message="Notification deleted successfully.")

@router.delete("", response_model=MessageResponse)
def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete all notifications for current user."""
    db.query(Notification).filter(Notification.user_id == current_user.id).delete()
    db.commit()
    return MessageResponse(success=True, message="All notifications cleared successfully.")
