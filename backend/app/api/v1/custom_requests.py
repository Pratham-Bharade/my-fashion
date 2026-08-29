from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_current_active_admin
from app.models.custom_request import CustomRequest, CustomRequestImage, CustomRequestStatus
from app.models.quotation import Quotation
from app.models.user import User, UserRole
from app.schemas.custom_request import (
    CustomRequestCreate,
    CustomRequestRead,
    CustomRequestStatusUpdate,
    CustomRequestCancel
)
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.services.notification_service import notification_service
from app.models.notification import NotificationType
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/custom-requests", tags=["Custom Stitching Requests"])

@router.get("/my", response_model=ApiResponse[List[CustomRequestRead]])
def get_my_custom_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer: View all submitted custom order requests, sorting latest updated & notified items to the top."""
    requests = db.query(CustomRequest).filter(
        CustomRequest.customer_id == current_user.id
    ).order_by(CustomRequest.updated_at.desc()).all()
    return ApiResponse(success=True, data=requests)

@router.get("", response_model=PaginatedResponse[CustomRequestRead])
def list_custom_requests(
    request_status: Optional[CustomRequestStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Filter and review all customer custom requests."""
    query = db.query(CustomRequest)
    if request_status:
        query = query.filter(CustomRequest.status == request_status)

    total = query.count()
    offset = (page - 1) * limit
    requests = query.order_by(CustomRequest.created_at.desc()).offset(offset).limit(limit).all()
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        items=requests,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{id}", response_model=ApiResponse[CustomRequestRead])
def get_custom_request(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single custom stitching request details."""
    req = db.query(CustomRequest).filter(CustomRequest.id == id).first()
    if not req:
        raise NotFoundException("Custom Request")

    if current_user.role != UserRole.ADMIN and req.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to this custom request.")

    return ApiResponse(success=True, data=req)

@router.post("", response_model=ApiResponse[CustomRequestRead], status_code=status.HTTP_201_CREATED)
def create_custom_request(
    payload: CustomRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer: Submit a custom stitching inquiry with inspiration images."""
    if payload.phone and payload.phone.strip():
        clean_phone = payload.phone.strip()
        if not current_user.phone:
            existing_user_phone = db.query(User).filter(
                User.phone == clean_phone,
                User.id != current_user.id
            ).first()
            if not existing_user_phone:
                current_user.phone = clean_phone
                db.add(current_user)

    req = CustomRequest(
        customer_id=current_user.id,
        design_id=payload.design_id,
        garment_type=payload.garment_type,
        description=payload.description,
        contact_phone=payload.phone.strip() if payload.phone else current_user.phone,
        fabric=payload.fabric,
        preferred_color=payload.preferred_color,
        occasion=payload.occasion,
        required_date=payload.required_date,
        measurement_profile_id=payload.measurement_profile_id,
        status=CustomRequestStatus.SUBMITTED
    )
    db.add(req)
    db.flush()

    if payload.image_paths:
        for img_path in payload.image_paths:
            img = CustomRequestImage(
                request_id=req.id,
                file_path=img_path
            )
            db.add(img)

    db.commit()
    db.refresh(req)

    # Notify admins about incoming custom inquiry
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    for adm in admins:
        notification_service.create_notification(
            db=db,
            user_id=adm.id,
            title=f"New Custom Request: {req.garment_type}",
            message=f"Customer {current_user.name} ({req.contact_phone or 'No phone'}) requested custom stitching for '{req.garment_type}'.",
            type=NotificationType.GENERAL,
            link_url="/admin/custom-requests"
        )

    return ApiResponse(
        success=True,
        message="Your custom stitching request has been submitted. Our master tailor will review it and prepare your price quotation.",
        data=req
    )

@router.patch("/{id}/status", response_model=ApiResponse[CustomRequestRead])
def update_custom_request_status(
    id: str,
    payload: CustomRequestStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Update status of custom stitching request."""
    req = db.query(CustomRequest).filter(CustomRequest.id == id).first()
    if not req:
        raise NotFoundException("Custom Request")

    req.status = payload.status
    req.updated_at = datetime.now(timezone.utc)
    if payload.notes:
        req.notes = f"{req.notes or ''}\n[Status Note]: {payload.notes}".strip()
    db.commit()
    db.refresh(req)
    return ApiResponse(success=True, message=f"Status changed to {payload.status.value}.", data=req)

@router.patch("/{id}/cancel", response_model=ApiResponse[CustomRequestRead])
def cancel_custom_request(
    id: str,
    payload: Optional[CustomRequestCancel] = None,
    reason: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer or Admin: Cancel custom stitching request and save reason in the cancellations archive."""
    req = db.query(CustomRequest).filter(CustomRequest.id == id).first()
    if not req:
        raise NotFoundException("Custom Request")

    if current_user.role != UserRole.ADMIN and req.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to cancel this request.")

    cancel_reason = None
    if payload:
        cancel_reason = payload.reason or payload.notes
    if not cancel_reason:
        cancel_reason = reason or "No reason specified"

    req.status = CustomRequestStatus.CANCELLED
    req.updated_at = datetime.now(timezone.utc)
    req.notes = f"{req.notes or ''}\n[Cancellation Reason]: {cancel_reason}".strip()

    db.commit()
    db.refresh(req)

    # Notify counterpart
    if current_user.role == UserRole.CUSTOMER:
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for adm in admins:
            notification_service.create_notification(
                db=db,
                user_id=adm.id,
                title="Custom Request Cancelled by Customer",
                message=f"Customer {current_user.name} ({current_user.phone or 'No phone'}) cancelled custom request for '{req.garment_type}'. Reason: {cancel_reason}",
                type=NotificationType.GENERAL,
                link_url="/admin/custom-requests"
            )
    else:
        notification_service.create_notification(
            db=db,
            user_id=req.customer_id,
            title="Custom Request Cancelled",
            message=f"Your custom stitching request for '{req.garment_type}' has been cancelled by the boutique. Reason: {cancel_reason}",
            type=NotificationType.GENERAL,
            link_url="/cancellations"
        )

    return ApiResponse(success=True, message="Custom request marked as cancelled and saved in cancellations.", data=req)

@router.delete("/{id}", response_model=MessageResponse)
def delete_custom_request(
    id: str,
    reason: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin or Customer: Permanently delete a custom stitching request."""
    req = db.query(CustomRequest).filter(CustomRequest.id == id).first()
    if not req:
        raise NotFoundException("Custom Request")

    if current_user.role != UserRole.ADMIN and req.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to delete this request.")

    customer_id = req.customer_id
    garment_type = req.garment_type

    # Delete associated quotations and images
    db.query(Quotation).filter(Quotation.custom_request_id == id).delete(synchronize_session=False)
    db.query(CustomRequestImage).filter(CustomRequestImage.request_id == id).delete(synchronize_session=False)

    db.delete(req)
    db.commit()
    return MessageResponse(success=True, message=f"Custom request for '{garment_type}' deleted permanently.")
