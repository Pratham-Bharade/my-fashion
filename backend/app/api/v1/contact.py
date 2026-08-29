from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_admin
from app.models.contact import ContactMessage, MessageStatus
from app.models.user import User
from app.schemas.contact import (
    ContactMessageCreate,
    ContactMessageStatusUpdate,
    ContactMessageRead
)
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.services.email_service import email_service
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/contact", tags=["Contact Inquiries"])

@router.post("", response_model=ApiResponse[ContactMessageRead], status_code=status.HTTP_201_CREATED)
def submit_contact_form(
    payload: ContactMessageCreate,
    db: Session = Depends(get_db)
):
    """Public: Submit contact form message and dispatch email to vandanabharade358@gmail.com."""
    message = ContactMessage(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        phone=payload.phone.strip() if payload.phone else None,
        message=payload.message.strip(),
        status=MessageStatus.UNREAD
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # Dispatch email notification to owner (vandanabharade358@gmail.com)
    email_service.send_contact_notification(
        sender_name=message.name,
        sender_email=message.email,
        sender_phone=message.phone,
        message=message.message
    )

    return ApiResponse(
        success=True,
        message="Thank you! Your message has been sent to Vandana Creations.",
        data=message
    )

@router.get("", response_model=PaginatedResponse[ContactMessageRead])
def list_contact_messages(
    message_status: Optional[MessageStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Review customer inquiries."""
    query = db.query(ContactMessage)
    if message_status:
        query = query.filter(ContactMessage.status == message_status)

    total = query.count()
    offset = (page - 1) * limit
    messages = query.order_by(ContactMessage.created_at.desc()).offset(offset).limit(limit).all()
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        items=messages,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.patch("/{id}/status", response_model=ApiResponse[ContactMessageRead])
def update_message_status(
    id: str,
    payload: ContactMessageStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Update status of inquiry (Read / Replied)."""
    msg = db.query(ContactMessage).filter(ContactMessage.id == id).first()
    if not msg:
        raise NotFoundException("Contact Message")

    msg.status = payload.status
    db.commit()
    db.refresh(msg)
    return ApiResponse(success=True, message="Status updated.", data=msg)
