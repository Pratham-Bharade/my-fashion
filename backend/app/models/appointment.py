import enum
from datetime import date, time
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Date, Time, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.service import Service
    from app.models.measurement import MeasurementProfile

class AppointmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"

class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    customer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("services.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    measurement_profile_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("measurement_profiles.id", ondelete="SET NULL"), nullable=True
    )
    appointment_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(
        String(20), default=AppointmentStatus.PENDING, nullable=False, index=True
    )
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reference_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    customer: Mapped["User"] = relationship("User", back_populates="appointments")
    service: Mapped["Service"] = relationship("Service", back_populates="appointments")
    measurement_profile: Mapped[Optional["MeasurementProfile"]] = relationship(
        "MeasurementProfile", back_populates="appointments"
    )
