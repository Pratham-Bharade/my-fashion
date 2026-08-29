import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType

logger = logging.getLogger(__name__)

class NotificationService:
    def create_notification(
        self,
        db: Session,
        user_id: str,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.GENERAL,
        link_url: Optional[str] = None,
        type: Optional[NotificationType] = None
    ) -> Notification:
        """
        Creates an in-app notification, commits to DB, and triggers external communication channels.
        Accepts either notification_type or type keyword argument.
        """
        effective_type = type or notification_type or NotificationType.GENERAL

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=effective_type,
            link_url=link_url
        )
        db.add(notification)
        try:
            db.commit()
            db.refresh(notification)
            logger.info(f"Notification successfully committed for user {user_id}: {title}")
        except Exception as e:
            logger.error(f"Failed to commit notification for user {user_id}: {e}")
            db.rollback()
            raise e

        self._dispatch_external_alert(notification)
        return notification

    def _dispatch_external_alert(self, notification: Notification):
        """Hook for external communication provider (WhatsApp/Email)."""
        pass

notification_service = NotificationService()
