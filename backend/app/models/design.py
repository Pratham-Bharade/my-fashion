import enum
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, Text, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.custom_request import CustomRequest
    from app.models.order import Order

class DesignCategory(str, enum.Enum):
    BLOUSE = "BLOUSE"
    BRIDAL = "BRIDAL"
    KURTI = "KURTI"
    LEHENGA = "LEHENGA"
    GOWN = "GOWN"
    EMBROIDERY = "EMBROIDERY"
    DESIGNER = "DESIGNER"

class Design(Base, TimestampMixin):
    __tablename__ = "designs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image: Mapped[str] = mapped_column(String(500), nullable=False)
    price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    allow_audio: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    custom_requests: Mapped[List["CustomRequest"]] = relationship("CustomRequest", back_populates="design")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="design")
