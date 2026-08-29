import enum
from datetime import date, datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Numeric, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.service import Service
    from app.models.design import Design
    from app.models.measurement import MeasurementProfile
    from app.models.custom_request import CustomRequest
    from app.models.payment import Payment
    from app.models.review import Review

class OrderStatus(str, enum.Enum):
    ORDER_RECEIVED = "ORDER_RECEIVED"
    MEASUREMENTS_CONFIRMED = "MEASUREMENTS_CONFIRMED"
    CUTTING = "CUTTING"
    STITCHING = "STITCHING"
    QUALITY_CHECK = "QUALITY_CHECK"
    READY = "READY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_number: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    customer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    service_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("services.id", ondelete="SET NULL"), nullable=True, index=True
    )
    design_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("designs.id", ondelete="SET NULL"), nullable=True
    )
    measurement_profile_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("measurement_profiles.id", ondelete="SET NULL"), nullable=True
    )
    custom_request_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("custom_requests.id", ondelete="SET NULL"), nullable=True
    )
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    advance_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    remaining_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    expected_delivery_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[OrderStatus] = mapped_column(
        String(30), default=OrderStatus.ORDER_RECEIVED, nullable=False, index=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    customer: Mapped["User"] = relationship("User", back_populates="orders")
    service: Mapped[Optional["Service"]] = relationship("Service", back_populates="orders")
    design: Mapped[Optional["Design"]] = relationship("Design", back_populates="orders")
    measurement_profile: Mapped[Optional["MeasurementProfile"]] = relationship(
        "MeasurementProfile", back_populates="orders"
    )
    custom_request: Mapped[Optional["CustomRequest"]] = relationship("CustomRequest", back_populates="orders")
    status_history: Mapped[List["OrderStatusHistory"]] = relationship(
        "OrderStatusHistory", back_populates="order", cascade="all, delete-orphan", order_by="OrderStatusHistory.created_at"
    )
    payments: Mapped[List["Payment"]] = relationship(
        "Payment", back_populates="order", cascade="all, delete-orphan"
    )
    review: Mapped[Optional["Review"]] = relationship(
        "Review", back_populates="order", uselist=False, cascade="all, delete-orphan"
    )

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[OrderStatus] = mapped_column(String(30), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    changed_by: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="status_history")
    actor: Mapped[Optional["User"]] = relationship("User")
