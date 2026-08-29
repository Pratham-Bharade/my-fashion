from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.measurement import MeasurementProfile, GarmentType
from app.models.user import User, UserRole
from app.schemas.measurement import (
    MeasurementProfileCreate,
    MeasurementProfileUpdate,
    MeasurementProfileRead
)
from app.schemas.common import ApiResponse, MessageResponse
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/measurements", tags=["Measurement Profiles"])

@router.get("", response_model=ApiResponse[List[MeasurementProfileRead]])
def list_measurements(
    customer_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List measurement profiles. Customers see their own; Admins can filter by customer_id."""
    query = db.query(MeasurementProfile)

    if current_user.role == UserRole.ADMIN:
        if customer_id:
            query = query.filter(MeasurementProfile.customer_id == customer_id)
    else:
        query = query.filter(MeasurementProfile.customer_id == current_user.id)

    profiles = query.order_by(MeasurementProfile.is_default.desc(), MeasurementProfile.created_at.desc()).all()
    return ApiResponse(success=True, data=profiles)

@router.get("/{id}", response_model=ApiResponse[MeasurementProfileRead])
def get_measurement(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve single measurement profile."""
    profile = db.query(MeasurementProfile).filter(MeasurementProfile.id == id).first()
    if not profile:
        raise NotFoundException("Measurement Profile")

    if current_user.role != UserRole.ADMIN and profile.customer_id != current_user.id:
        raise ForbiddenException("You do not have access to this measurement profile.")

    return ApiResponse(success=True, data=profile)

@router.post("", response_model=ApiResponse[MeasurementProfileRead], status_code=status.HTTP_201_CREATED)
def create_measurement(
    payload: MeasurementProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new flexible measurement profile."""
    target_customer_id = current_user.id

    # If new profile is default, reset previous defaults of same customer
    if payload.is_default:
        db.query(MeasurementProfile).filter(
            MeasurementProfile.customer_id == target_customer_id
        ).update({"is_default": False})

    profile = MeasurementProfile(
        customer_id=target_customer_id,
        name=payload.name.strip(),
        garment_type=payload.garment_type,
        measurements=payload.measurements,
        is_default=payload.is_default
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return ApiResponse(success=True, message="Measurement profile saved.", data=profile)

@router.put("/{id}", response_model=ApiResponse[MeasurementProfileRead])
def update_measurement(
    id: str,
    payload: MeasurementProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update measurement values or profile name."""
    profile = db.query(MeasurementProfile).filter(MeasurementProfile.id == id).first()
    if not profile:
        raise NotFoundException("Measurement Profile")

    if current_user.role != UserRole.ADMIN and profile.customer_id != current_user.id:
        raise ForbiddenException("You do not have permission to edit this profile.")

    if payload.is_default:
        db.query(MeasurementProfile).filter(
            MeasurementProfile.customer_id == profile.customer_id
        ).update({"is_default": False})

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return ApiResponse(success=True, message="Measurement profile updated.", data=profile)

@router.patch("/{id}/default", response_model=MessageResponse)
def set_default_measurement(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set profile as default for customer."""
    profile = db.query(MeasurementProfile).filter(MeasurementProfile.id == id).first()
    if not profile:
        raise NotFoundException("Measurement Profile")

    if current_user.role != UserRole.ADMIN and profile.customer_id != current_user.id:
        raise ForbiddenException("You do not have permission to modify this profile.")

    db.query(MeasurementProfile).filter(
        MeasurementProfile.customer_id == profile.customer_id
    ).update({"is_default": False})

    profile.is_default = True
    db.commit()
    return MessageResponse(success=True, message="Default measurement profile updated.")

@router.delete("/{id}", response_model=MessageResponse)
def delete_measurement(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete measurement profile."""
    profile = db.query(MeasurementProfile).filter(MeasurementProfile.id == id).first()
    if not profile:
        raise NotFoundException("Measurement Profile")

    if current_user.role != UserRole.ADMIN and profile.customer_id != current_user.id:
        raise ForbiddenException("You do not have permission to delete this profile.")

    db.delete(profile)
    db.commit()
    return MessageResponse(success=True, message="Measurement profile deleted.")
