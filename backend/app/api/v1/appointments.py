from typing import List, Optional
from datetime import date, time, timedelta, datetime, timezone
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_current_active_admin
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User, UserRole
from app.models.service import Service
from app.models.notification import NotificationType
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentStatusUpdate,
    AppointmentReschedule,
    AppointmentRead,
    AvailableSlot
)
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.services.slot_service import slot_service
from app.services.notification_service import notification_service
from app.core.exceptions import NotFoundException, ForbiddenException, ConflictException, ValidationException

router = APIRouter(prefix="/appointments", tags=["Appointments & Calendar"])

@router.get("/available-slots", response_model=ApiResponse[List[AvailableSlot]])
def get_available_slots(
    target_date: date = Query(..., description="Target booking date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Public: Check available 30-minute booking slots for a given date."""
    slots = slot_service.get_available_slots_for_date(db, target_date)
    return ApiResponse(success=True, data=slots)

@router.get("/my", response_model=ApiResponse[List[AppointmentRead]])
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer: List all personal appointments, sorting latest updated & notified items to the top."""
    appointments = db.query(Appointment).filter(
        Appointment.customer_id == current_user.id
    ).order_by(Appointment.updated_at.desc()).all()

    return ApiResponse(success=True, data=appointments)

@router.get("", response_model=PaginatedResponse[AppointmentRead])
def list_appointments_admin(
    target_date: Optional[date] = Query(None, alias="date"),
    status_filter: Optional[AppointmentStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Search and manage appointments with date and status filters."""
    query = db.query(Appointment)

    if target_date:
        query = query.filter(Appointment.appointment_date == target_date)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    total = query.count()
    offset = (page - 1) * limit
    appointments = query.order_by(
        Appointment.appointment_date.desc(),
        Appointment.start_time.asc()
    ).offset(offset).limit(limit).all()

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        items=appointments,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{id}", response_model=ApiResponse[AppointmentRead])
def get_appointment(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single appointment details."""
    apt = db.query(Appointment).filter(Appointment.id == id).first()
    if not apt:
        raise NotFoundException("Appointment")

    if current_user.role != UserRole.ADMIN and apt.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to this appointment.")

    return ApiResponse(success=True, data=apt)

@router.post("", response_model=ApiResponse[AppointmentRead], status_code=status.HTTP_201_CREATED)
def book_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer: Book a tailoring consultation slot (prevents double-booking)."""
    # Verify service
    service = db.query(Service).filter(Service.id == payload.service_id, Service.is_active == True).first()
    if not service:
        raise NotFoundException("Tailoring Service")

    # Reserve slot with concurrency check
    start_t, end_t = slot_service.validate_and_reserve_slot(
        db=db,
        target_date=payload.appointment_date,
        start_time_str=payload.start_time
    )

    # Save / Update customer contact phone safely
    phone_to_use = (payload.phone or current_user.phone or "").strip()
    if payload.phone and payload.phone.strip():
        clean_p = payload.phone.strip()
        conflict = db.query(User).filter(User.phone == clean_p, User.id != current_user.id).first()
        if not conflict:
            current_user.phone = clean_p
            db.add(current_user)

    appointment = Appointment(
        customer_id=current_user.id,
        service_id=payload.service_id,
        measurement_profile_id=payload.measurement_profile_id,
        appointment_date=payload.appointment_date,
        start_time=start_t,
        end_time=end_t,
        status=AppointmentStatus.PENDING,
        contact_phone=phone_to_use or None,
        notes=payload.notes,
        reference_image=payload.reference_image
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Dispatch notification to customer
    notification_service.create_notification(
        db=db,
        user_id=current_user.id,
        title="Appointment Requested",
        message=f"Your booking for {service.name} on {payload.appointment_date.strftime('%d %B %Y')} at {payload.start_time} has been received. Our team will review and confirm your slot.",
        type=NotificationType.GENERAL,
        link_url="/appointments"
    )

    return ApiResponse(
        success=True,
        message=f"Appointment booked successfully for {payload.appointment_date.strftime('%d %B %Y')} at {payload.start_time}!",
        data=appointment
    )

@router.patch("/{id}/status", response_model=ApiResponse[AppointmentRead])
def update_appointment_status(
    id: str,
    payload: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin or Customer: Update appointment status (Confirm / Cancel)."""
    apt = db.query(Appointment).filter(Appointment.id == id).first()
    if not apt:
        raise NotFoundException("Appointment")

    if current_user.role != UserRole.ADMIN and apt.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to manage this appointment.")

    # If customer is cancelling
    if current_user.role != UserRole.ADMIN and payload.status != AppointmentStatus.CANCELLED:
        raise ForbiddenException("Customers can only cancel their appointments.")

    apt.status = payload.status
    apt.updated_at = datetime.now(timezone.utc)
    if payload.notes:
        apt.notes = f"{apt.notes or ''} [Status note: {payload.notes}]".strip()
    db.commit()
    db.refresh(apt)

    time_str = apt.start_time.strftime('%I:%M %p') if hasattr(apt.start_time, 'strftime') else str(apt.start_time)
    date_str = apt.appointment_date.strftime('%d %B %Y')
    service_name = apt.service.name if apt.service else "Tailoring Consultation"

    # Notify customer if admin updated
    if current_user.role == UserRole.ADMIN:
        note_suffix = f" Note from Tailor: \"{payload.notes.strip()}\"" if payload.notes and payload.notes.strip() else ""
        if payload.status == AppointmentStatus.CONFIRMED:
            title = "Appointment Confirmed 🎉"
            msg = f"Your appointment for {service_name} on {date_str} at {time_str} has been confirmed.{note_suffix}"
            n_type = NotificationType.APPOINTMENT_CONFIRMED
        elif payload.status == AppointmentStatus.CANCELLED:
            title = "Appointment Cancelled"
            msg = f"Your appointment for {service_name} on {date_str} has been cancelled.{note_suffix}"
            n_type = NotificationType.GENERAL
        else:
            title = f"Appointment {payload.status.value.title()}"
            msg = f"Your appointment for {service_name} on {date_str} is now marked as {payload.status.value.lower()}.{note_suffix}"
            n_type = NotificationType.GENERAL

        notification_service.create_notification(
            db=db,
            user_id=apt.customer_id,
            title=title,
            message=msg,
            type=n_type,
            link_url="/appointments"
        )
    elif current_user.role == UserRole.CUSTOMER and payload.status == AppointmentStatus.CANCELLED:
        # Notify all admins with the customer's cancellation reason
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for adm in admins:
            notification_service.create_notification(
                db=db,
                user_id=adm.id,
                title="Appointment Cancelled by Customer",
                message=f"Customer {current_user.name} ({current_user.phone or 'No phone'}) cancelled appointment for '{service_name}' on {date_str}. Reason: {payload.notes or 'No reason provided'}",
                type=NotificationType.GENERAL,
                link_url="/admin/appointments"
            )

    return ApiResponse(
        success=True,
        message=f"Appointment status updated to {payload.status.value}.",
        data=apt
    )

@router.patch("/{id}/reschedule", response_model=ApiResponse[AppointmentRead])
def reschedule_appointment(
    id: str,
    payload: AppointmentReschedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer or Admin: Reschedule appointment date and time slot."""
    apt = db.query(Appointment).filter(Appointment.id == id).first()
    if not apt:
        raise NotFoundException("Appointment")

    if current_user.role != UserRole.ADMIN and apt.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to reschedule this appointment.")

    start_t, end_t = slot_service.validate_and_reserve_slot(
        db=db,
        target_date=payload.appointment_date,
        start_time_str=payload.start_time
    )

    apt.appointment_date = payload.appointment_date
    apt.start_time = start_t
    apt.end_time = end_t
    apt.status = AppointmentStatus.CONFIRMED if current_user.role == UserRole.ADMIN else AppointmentStatus.PENDING
    db.commit()
    db.refresh(apt)

    if current_user.role == UserRole.ADMIN:
        time_str = apt.start_time.strftime('%I:%M %p') if hasattr(apt.start_time, 'strftime') else str(apt.start_time)
        date_str = apt.appointment_date.strftime('%d %B %Y')
        notification_service.create_notification(
            db=db,
            user_id=apt.customer_id,
            title="Appointment Rescheduled & Confirmed 📅",
            message=f"Your appointment slot has been updated to {date_str} at {time_str}.",
            type=NotificationType.APPOINTMENT_CONFIRMED,
            link_url="/appointments"
        )

    return ApiResponse(
        success=True,
        message="Appointment rescheduled successfully.",
        data=apt
    )

@router.delete("/{id}", response_model=MessageResponse)
def delete_appointment(
    id: str,
    reason: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin or Customer: Permanently delete an appointment record with cancellation reason."""
    apt = db.query(Appointment).filter(Appointment.id == id).first()
    if not apt:
        raise NotFoundException("Appointment")

    if current_user.role != UserRole.ADMIN and apt.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to delete this appointment.")

    service_name = apt.service.name if apt.service else "Tailoring Consultation"
    date_str = apt.appointment_date.strftime('%d %B %Y')

    # Notify admins if customer cancelled
    if current_user.role == UserRole.CUSTOMER:
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for adm in admins:
            notification_service.create_notification(
                db=db,
                user_id=adm.id,
                title="Appointment Cancelled by Customer",
                message=f"Customer {current_user.name} ({current_user.phone or 'No phone'}) cancelled appointment for '{service_name}' on {date_str}. Reason: {reason or 'No reason provided'}",
                type=NotificationType.GENERAL,
                link_url="/admin/appointments"
            )

    db.delete(apt)
    db.commit()
    return MessageResponse(success=True, message="Appointment deleted successfully.")
