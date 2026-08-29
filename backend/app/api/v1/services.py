from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_admin, get_optional_current_user
from app.models.service import Service
from app.models.user import User, UserRole
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceRead
from app.schemas.common import ApiResponse, MessageResponse
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/services", tags=["Services Catalog"])

@router.get("", response_model=ApiResponse[List[ServiceRead]])
def list_services(
    category: Optional[str] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Public: List services filterable by category."""
    query = db.query(Service)

    # Only admins can view inactive services
    if not (current_user and current_user.role == UserRole.ADMIN and include_inactive):
        query = query.filter(Service.is_active == True)

    if category and category.upper() != "ALL":
        query = query.filter(Service.category.ilike(category.strip()))

    services = query.order_by(Service.price.asc()).all()
    return ApiResponse(success=True, data=services)

@router.get("/{id}", response_model=ApiResponse[ServiceRead])
def get_service(id: str, db: Session = Depends(get_db)):
    """Get single service details."""
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise NotFoundException("Service")
    return ApiResponse(success=True, data=service)

@router.post("", response_model=ApiResponse[ServiceRead], status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Add a new tailoring service to the catalog with custom category."""
    category_clean = payload.category.strip().upper()
    service = Service(
        name=payload.name.strip(),
        category=category_clean,
        description=payload.description,
        price=payload.price,
        estimated_days=payload.estimated_days,
        image=payload.image,
        allow_audio=payload.allow_audio,
        is_active=payload.is_active
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return ApiResponse(success=True, message="Service created successfully.", data=service)

@router.put("/{id}", response_model=ApiResponse[ServiceRead])
def update_service(
    id: str,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Update an existing tailoring service."""
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise NotFoundException("Service")

    update_data = payload.model_dump(exclude_unset=True)
    if "category" in update_data and update_data["category"]:
        update_data["category"] = update_data["category"].strip().upper()

    for field, value in update_data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return ApiResponse(success=True, message="Service updated successfully.", data=service)

@router.delete("/{id}", response_model=MessageResponse)
def delete_service(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Soft-delete/deactivate a tailoring service."""
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise NotFoundException("Service")

    service.is_active = False
    db.commit()
    return MessageResponse(success=True, message="Service deactivated successfully.")
