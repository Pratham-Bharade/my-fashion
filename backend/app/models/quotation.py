import enum
from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, Text, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin, generate_uuid

if TYPE_CHECKING:
    from app.models.custom_request import CustomRequest
    from app.models.user import User

class QuotationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class Quotation(Base, TimestampMixin):
    __tablename__ = "quotations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    custom_request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("custom_requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    customer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    base_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    additional_charges: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    discount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    final_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    advance_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    valid_until: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[QuotationStatus] = mapped_column(
        String(20), default=QuotationStatus.PENDING, nullable=False, index=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    custom_request: Mapped["CustomRequest"] = relationship("CustomRequest", back_populates="quotations")
    customer: Mapped["User"] = relationship("User")
