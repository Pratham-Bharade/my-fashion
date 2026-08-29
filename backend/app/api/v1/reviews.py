from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, get_current_active_admin
from app.models.review import Review, ReviewStatus
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewStatusUpdate, ReviewRead
from app.schemas.common import ApiResponse, PaginatedResponse, MessageResponse
from app.core.exceptions import NotFoundException, ForbiddenException, AppException, ConflictException

router = APIRouter(prefix="/reviews", tags=["Reviews & Feedback"])

@router.get("", response_model=ApiResponse[List[ReviewRead]])
def list_public_reviews(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Public: Retrieve approved customer testimonials."""
    reviews = db.query(Review).filter(
        Review.status == ReviewStatus.APPROVED
    ).order_by(Review.created_at.desc()).limit(limit).all()
    return ApiResponse(success=True, data=reviews)

@router.get("/admin", response_model=PaginatedResponse[ReviewRead])
def list_admin_reviews(
    review_status: Optional[ReviewStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Moderate customer reviews."""
    query = db.query(Review)
    if review_status:
        query = query.filter(Review.status == review_status)

    total = query.count()
    offset = (page - 1) * limit
    reviews = query.order_by(Review.created_at.desc()).offset(offset).limit(limit).all()
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse(
        items=reviews,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.post("", response_model=ApiResponse[ReviewRead], status_code=status.HTTP_201_CREATED)
def submit_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer: Submit a review for a delivered order."""
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise NotFoundException("Order")

    if order.customer_id != current_user.id:
        raise ForbiddenException("You can only review your own orders.")

    # Enforce Rule 8: Only delivered orders can receive reviews
    if order.status != OrderStatus.DELIVERED:
        raise AppException(
            status_code=400,
            message="Reviews can only be submitted for completed and delivered orders."
        )

    # Check if review already exists
    existing = db.query(Review).filter(Review.order_id == order.id).first()
    if existing:
        raise ConflictException("A review has already been submitted for this order.")

    review = Review(
        customer_id=current_user.id,
        order_id=order.id,
        rating=payload.rating,
        comment=payload.comment.strip(),
        status=ReviewStatus.PENDING
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ApiResponse(
        success=True,
        message="Thank you! Your review has been submitted and will appear after boutique moderation.",
        data=review
    )

@router.patch("/{id}/status", response_model=ApiResponse[ReviewRead])
def moderate_review_status(
    id: str,
    payload: ReviewStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Approve or hide customer review."""
    review = db.query(Review).filter(Review.id == id).first()
    if not review:
        raise NotFoundException("Review")

    review.status = payload.status
    db.commit()
    db.refresh(review)
    return ApiResponse(success=True, message=f"Review marked as {payload.status.value}.", data=review)

@router.delete("/{id}", response_model=MessageResponse)
def delete_review(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Delete review."""
    review = db.query(Review).filter(Review.id == id).first()
    if not review:
        raise NotFoundException("Review")

    db.delete(review)
    db.commit()
    return MessageResponse(success=True, message="Review deleted successfully.")
