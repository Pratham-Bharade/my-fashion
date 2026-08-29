import random
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.order import Order, OrderStatus, OrderStatusHistory
from app.models.notification import NotificationType
from app.services.notification_service import notification_service
from app.core.exceptions import AppException

STATUS_MESSAGES = {
    OrderStatus.ORDER_RECEIVED: (
        "Order Confirmed & Received 🎉",
        "Your tailoring order #{order_number} has been confirmed by Vandana Creations."
    ),
    OrderStatus.MEASUREMENTS_CONFIRMED: (
        "Measurements Verified 📏",
        "Measurements for order #{order_number} have been confirmed by our master tailor."
    ),
    OrderStatus.CUTTING: (
        "Fabric Cutting Stage ✂️",
        "Fabric for order #{order_number} is being precision cut with styling margins."
    ),
    OrderStatus.STITCHING: (
        "Stitching in Progress 🪡",
        "Your garment for order #{order_number} is currently being handcrafted on the master stitching table."
    ),
    OrderStatus.QUALITY_CHECK: (
        "Quality Check & Finishing 🔍",
        "Order #{order_number} has finished stitching and is undergoing quality inspection."
    ),
    OrderStatus.READY: (
        "Order Ready for Pickup / Trial! 👗",
        "Your bespoke outfit for order #{order_number} is ready! You can visit our boutique for trial & pickup."
    ),
    OrderStatus.DELIVERED: (
        "Order Completed & Delivered ✨",
        "Order #{order_number} has been delivered. We hope you love your fit! Thank you for choosing Vandana Creations."
    ),
    OrderStatus.CANCELLED: (
        "Order Cancelled",
        "Order #{order_number} has been marked as cancelled."
    ),
}

class OrderService:
    def generate_order_number(self, db: Session) -> str:
        """Generates a human-friendly unique order reference e.g. SC-2026-1042."""
        year = datetime.now().year
        count = db.query(Order).count() + 1
        rand_suffix = random.randint(10, 99)
        return f"SC-{year}-{count:03d}{rand_suffix}"

    def update_order_status(
        self,
        db: Session,
        order: Order,
        new_status: OrderStatus,
        notes: Optional[str] = None,
        changed_by_user_id: Optional[str] = None
    ) -> Order:
        """
        Updates order status, records history log, and dispatches a customer notification.
        """
        order.status = new_status
        order.updated_at = datetime.now(timezone.utc)

        # Create history entry
        history = OrderStatusHistory(
            order_id=order.id,
            status=new_status,
            notes=notes,
            changed_by=changed_by_user_id,
            created_at=datetime.now(timezone.utc)
        )
        db.add(history)

        # Send customer notification
        if new_status in STATUS_MESSAGES:
            title, msg_tpl = STATUS_MESSAGES[new_status]
            msg = msg_tpl.format(order_number=order.order_number)
            if notes:
                msg += f" Note: {notes}"

            notif_type = NotificationType.ORDER_READY if new_status == OrderStatus.READY else NotificationType.ORDER_STATUS_CHANGED

            notification_service.create_notification(
                db=db,
                user_id=order.customer_id,
                title=title,
                message=msg,
                notification_type=notif_type,
                link_url="/notifications"
            )

        db.flush()
        return order

order_service = OrderService()
