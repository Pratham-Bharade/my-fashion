import enum
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, Text, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.appointment import Appointment
    from app.models.order import Order

class ServiceCategory(str, enum.Enum):
    BLOUSE = "BLOUSE"
    TRADITIONAL = "TRADITIONAL"
    DRESSES = "DRESSES"
    KURTIS = "KURTIS"
    ALTERATIONS = "ALTERATIONS"
    BRIDAL = "BRIDAL"
    LEHENGA = "LEHENGA"

class Service(Base, TimestampMixin):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    estimated_days: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    allow_audio: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    appointments: Mapped[List["Appointment"]] = relationship("Appointment", back_populates="service")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="service")
