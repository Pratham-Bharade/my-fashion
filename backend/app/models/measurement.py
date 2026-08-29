import enum
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.appointment import Appointment
    from app.models.custom_request import CustomRequest
    from app.models.order import Order

class GarmentType(str, enum.Enum):
    BLOUSE = "BLOUSE"
    KURTI = "KURTI"
    SALWAR_SUIT = "SALWAR_SUIT"
    LEHENGA = "LEHENGA"
    GOWN = "GOWN"
    CUSTOM = "CUSTOM"

class MeasurementProfile(Base, TimestampMixin):
    __tablename__ = "measurement_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    customer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    garment_type: Mapped[GarmentType] = mapped_column(String(50), nullable=False, index=True)
    # JSON containing specific measurement keys e.g. bust, waist, shoulder, armhole, front_neck, back_neck, length
    measurements: Mapped[dict] = mapped_column(JSON, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    customer: Mapped["User"] = relationship("User", back_populates="measurement_profiles")
    appointments: Mapped[List["Appointment"]] = relationship("Appointment", back_populates="measurement_profile")
    custom_requests: Mapped[List["CustomRequest"]] = relationship("CustomRequest", back_populates="measurement_profile")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="measurement_profile")
