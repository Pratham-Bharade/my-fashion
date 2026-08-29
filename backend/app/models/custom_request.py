import enum
from datetime import date
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.design import Design
    from app.models.measurement import MeasurementProfile
    from app.models.quotation import Quotation
    from app.models.order import Order

class CustomRequestStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    REVIEWING = "REVIEWING"
    QUOTATION_SENT = "QUOTATION_SENT"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    CONVERTED_TO_ORDER = "CONVERTED_TO_ORDER"

class CustomRequest(Base, TimestampMixin):
    __tablename__ = "custom_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    customer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    design_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("designs.id", ondelete="SET NULL"), nullable=True
    )
    garment_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    fabric: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    preferred_color: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    occasion: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    required_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    measurement_profile_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("measurement_profiles.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[CustomRequestStatus] = mapped_column(
        String(30), default=CustomRequestStatus.SUBMITTED, nullable=False, index=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    customer: Mapped["User"] = relationship("User", back_populates="custom_requests")
    design: Mapped[Optional["Design"]] = relationship("Design", back_populates="custom_requests")
    measurement_profile: Mapped[Optional["MeasurementProfile"]] = relationship(
        "MeasurementProfile", back_populates="custom_requests"
    )
    images: Mapped[List["CustomRequestImage"]] = relationship(
        "CustomRequestImage", back_populates="request", cascade="all, delete-orphan"
    )
    quotations: Mapped[List["Quotation"]] = relationship(
        "Quotation", back_populates="custom_request", cascade="all, delete-orphan"
    )
    orders: Mapped[List["Order"]] = relationship(
        "Order", back_populates="custom_request"
    )

class CustomRequestImage(Base):
    __tablename__ = "custom_request_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("custom_requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)

    # Relationship
    request: Mapped["CustomRequest"] = relationship("CustomRequest", back_populates="images")
