import enum
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.order import Order
    from app.models.user import User

class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    UPI = "UPI"
    ONLINE = "ONLINE"

class PaymentType(str, enum.Enum):
    ADVANCE = "ADVANCE"
    REMAINING = "REMAINING"
    FULL = "FULL"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    customer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    payment_type: Mapped[PaymentType] = mapped_column(String(20), default=PaymentType.ADVANCE, nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(String(20), nullable=False)
    transaction_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[PaymentStatus] = mapped_column(
        String(20), default=PaymentStatus.PAID, nullable=False, index=True
    )
    paid_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="payments")
    customer: Mapped["User"] = relationship("User", back_populates="payments")
