from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base, generate_uuid

class BusinessSettings(Base):
    __tablename__ = "business_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    business_name: Mapped[str] = mapped_column(String(150), nullable=False)
    logo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    whatsapp: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    working_hours: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    holidays: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    social_links: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    about_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
