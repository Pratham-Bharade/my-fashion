from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_admin, get_optional_current_user
from app.models.design import Design
from app.models.user import User, UserRole
from app.schemas.design import DesignCreate, DesignUpdate, DesignRead
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/designs", tags=["Design Gallery"])

@router.get("", response_model=PaginatedResponse[DesignRead])
def list_designs(
    category: Optional[str] = None,
    search: Optional[str] = None,
    tag: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Public: Browse gallery designs with categories and search."""
    query = db.query(Design)

    if not (current_user and current_user.role == UserRole.ADMIN and include_inactive):
        query = query.filter(Design.is_active == True)

    if category and category.upper() != "ALL":
        query = query.filter(Design.category.ilike(category.strip()))

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Design.title.ilike(s)) | (Design.description.ilike(s))
        )

    total = query.count()
    offset = (page - 1) * limit
    designs = query.order_by(Design.created_at.desc()).offset(offset).limit(limit).all()

    # Filter by tag in-memory for JSON field if specified
    if tag:
        t_clean = tag.strip().lower()
        designs = [d for d in designs if d.tags and any(t_clean in str(t).lower() for t in d.tags)]

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        items=designs,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{id}", response_model=ApiResponse[DesignRead])
def get_design(id: str, db: Session = Depends(get_db)):
    """Get single design details."""
    design = db.query(Design).filter(Design.id == id).first()
    if not design:
        raise NotFoundException("Design")
    return ApiResponse(success=True, data=design)

@router.post("", response_model=ApiResponse[DesignRead], status_code=status.HTTP_201_CREATED)
def create_design(
    payload: DesignCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Add a design to the gallery with custom category."""
    category_clean = payload.category.strip().upper()
    design = Design(
        title=payload.title.strip(),
        category=category_clean,
        description=payload.description,
        image=payload.image,
        price=payload.price,
        tags=payload.tags or [],
        allow_audio=payload.allow_audio,
        is_active=payload.is_active
    )
    db.add(design)
    db.commit()
    db.refresh(design)
    return ApiResponse(success=True, message="Design published to gallery successfully.", data=design)

@router.put("/{id}", response_model=ApiResponse[DesignRead])
def update_design(
    id: str,
    payload: DesignUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Update an existing design."""
    design = db.query(Design).filter(Design.id == id).first()
    if not design:
        raise NotFoundException("Design")

    update_data = payload.model_dump(exclude_unset=True)
    if "category" in update_data and update_data["category"]:
        update_data["category"] = update_data["category"].strip().upper()

    for field, value in update_data.items():
        setattr(design, field, value)

    db.commit()
    db.refresh(design)
    return ApiResponse(success=True, message="Design updated successfully.", data=design)

@router.delete("/{id}", response_model=MessageResponse)
def delete_design(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Delete/deactivate design."""
    design = db.query(Design).filter(Design.id == id).first()
    if not design:
        raise NotFoundException("Design")

    design.is_active = False
    db.commit()
    return MessageResponse(success=True, message="Design removed from active gallery.")
