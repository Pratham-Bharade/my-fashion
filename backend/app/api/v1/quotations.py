from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_current_active_admin
from app.models.quotation import Quotation, QuotationStatus
from app.models.custom_request import CustomRequest, CustomRequestStatus
from app.models.user import User, UserRole
from app.schemas.quotation import (
    QuotationCreate,
    QuotationRespond,
    QuotationRead,
    QuotationMessageCreate
)
from app.schemas.order import OrderRead
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.services.quotation_service import quotation_service
from app.services.notification_service import notification_service
from app.models.notification import NotificationType
from app.core.exceptions import NotFoundException, ForbiddenException, AppException

router = APIRouter(prefix="/quotations", tags=["Quotations & Estimates"])

@router.get("", response_model=PaginatedResponse[QuotationRead])
def list_quotations(
    status_filter: Optional[QuotationStatus] = Query(None, alias="status"),
    search: Optional[str] = None,
    customer_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: List all boutique price quotations across statuses."""
    query = db.query(Quotation)

    if status_filter:
        query = query.filter(Quotation.status == status_filter)
    if customer_id:
        query = query.filter(Quotation.customer_id == customer_id)
    if search:
        s = f"%{search.strip()}%"
        query = query.join(Quotation.customer).filter(
            (User.name.ilike(s)) | (User.phone.ilike(s))
        )

    total = query.count()
    offset = (page - 1) * limit
    quotations = query.order_by(Quotation.created_at.desc()).offset(offset).limit(limit).all()
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        items=quotations,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.post("", response_model=ApiResponse[QuotationRead], status_code=status.HTTP_201_CREATED)
def create_quotation(
    payload: QuotationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Generate and dispatch a price quotation for a custom request."""
    req = db.query(CustomRequest).filter(CustomRequest.id == payload.custom_request_id).first()
    if not req:
        raise NotFoundException("Custom Request")

    final_amt = quotation_service.calculate_final_amount(
        base_price=payload.base_price,
        additional_charges=payload.additional_charges,
        discount=payload.discount
    )

    quote = Quotation(
        custom_request_id=req.id,
        customer_id=req.customer_id,
        base_price=payload.base_price,
        additional_charges=payload.additional_charges,
        discount=payload.discount,
        final_amount=final_amt,
        advance_amount=payload.advance_amount,
        valid_until=payload.valid_until,
        status=QuotationStatus.PENDING,
        notes=payload.notes
    )
    db.add(quote)
    req.status = CustomRequestStatus.QUOTATION_SENT
    db.commit()
    db.refresh(quote)

    # Notify customer
    notes_preview = f" Note: {payload.notes.strip()}" if payload.notes and payload.notes.strip() else ""
    notification_service.create_notification(
        db=db,
        user_id=req.customer_id,
        title="Custom Stitching Quotation Ready",
        message=f"A price quotation of ₹{final_amt:,.2f} for your '{req.garment_type}' request has been provided by our master tailor.{notes_preview} Please review to accept or decline.",
        type=NotificationType.QUOTATION_CREATED,
        link_url="/custom-requests"
    )

    return ApiResponse(success=True, message="Quotation generated and sent to customer.", data=quote)

@router.get("/{id}", response_model=ApiResponse[QuotationRead])
def get_quotation(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quotation details."""
    quote = db.query(Quotation).filter(Quotation.id == id).first()
    if not quote:
        raise NotFoundException("Quotation")

    if current_user.role != UserRole.ADMIN and quote.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to this quotation.")

    return ApiResponse(success=True, data=quote)

@router.patch("/{id}/respond", response_model=ApiResponse[QuotationRead])
def respond_to_quotation(
    id: str,
    payload: QuotationRespond,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer: Accept or reject quotation."""
    quote = db.query(Quotation).filter(Quotation.id == id).first()
    if not quote:
        raise NotFoundException("Quotation")

    if quote.customer_id != current_user.id:
        raise ForbiddenException("Only the designated customer can respond to this quotation.")

    if quote.status != QuotationStatus.PENDING:
        raise AppException(status_code=400, message=f"Quotation has already been {quote.status.value.lower()}.")

    action_str = "ACCEPTED" if payload.accept else "DECLINED"
    if payload.accept:
        quote.status = QuotationStatus.ACCEPTED
        if quote.custom_request:
            quote.custom_request.status = CustomRequestStatus.ACCEPTED
        msg = "You have accepted the quotation! Our boutique has been notified to initiate the order."
    else:
        quote.status = QuotationStatus.REJECTED
        if quote.custom_request:
            quote.custom_request.status = CustomRequestStatus.REJECTED
        msg = "Quotation declined."

    if payload.notes:
        quote.notes = f"{quote.notes or ''}\n[Customer note]: {payload.notes}".strip()

    db.commit()
    db.refresh(quote)

    # Notify Admins about customer acceptance/rejection
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    title = f"Quotation {action_str} by Customer 🎉" if payload.accept else f"Quotation {action_str} by Customer"
    garment_name = quote.custom_request.garment_type if quote.custom_request else "Custom Tailoring"
    for adm in admins:
        notification_service.create_notification(
            db=db,
            user_id=adm.id,
            title=title,
            message=f"Customer {current_user.name} ({current_user.phone or 'No phone'}) has {action_str.lower()} quotation of ₹{quote.final_amount:,.2f} for '{garment_name}'.",
            type=NotificationType.GENERAL,
            link_url="/admin/quotations"
        )

    return ApiResponse(success=True, message=msg, data=quote)

@router.post("/{id}/message", response_model=ApiResponse[QuotationRead])
def send_quotation_message(
    id: str,
    payload: QuotationMessageCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Send a direct message/note to customer regarding their quotation with in-app notification."""
    quote = db.query(Quotation).filter(Quotation.id == id).first()
    if not quote:
        raise NotFoundException("Quotation")

    # Record message in notes
    quote.notes = f"{quote.notes or ''}\n[Tailor message]: {payload.message}".strip()
    db.commit()
    db.refresh(quote)

    garment_name = quote.custom_request.garment_type if quote.custom_request else "Custom Stitching"

    # Send Notification to Customer
    notification_service.create_notification(
        db=db,
        user_id=quote.customer_id,
        title=f"Message Regarding Quotation: {garment_name}",
        message=f"Message from atelier for your '{garment_name}' quotation (₹{quote.final_amount:,.2f}): \"{payload.message}\"",
        type=NotificationType.GENERAL,
        link_url="/custom-requests"
    )

    return ApiResponse(
        success=True,
        message=f"Message and notification successfully sent to customer.",
        data=quote
    )

@router.post("/{id}/convert-to-order", response_model=ApiResponse[OrderRead])
def convert_to_order(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Convert an accepted quotation into an active production order."""
    quote = db.query(Quotation).filter(Quotation.id == id).first()
    if not quote:
        raise NotFoundException("Quotation")

    order = quotation_service.convert_quotation_to_order(
        db=db,
        quotation=quote,
        admin_user_id=admin.id
    )
    db.commit()
    db.refresh(order)

    return ApiResponse(
        success=True,
        message=f"Order {order.order_number} created successfully from quotation.",
        data=order
    )

@router.delete("/{id}", response_model=MessageResponse)
def delete_quotation(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Delete a quotation record."""
    quote = db.query(Quotation).filter(Quotation.id == id).first()
    if not quote:
        raise NotFoundException("Quotation")

    db.delete(quote)
    db.commit()
    return MessageResponse(success=True, message="Quotation deleted successfully.")
