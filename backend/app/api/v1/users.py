from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User, CustomerProfile
from app.schemas.user import UserRead, UserUpdate
from app.schemas.auth import ChangePasswordRequest
from app.schemas.common import ApiResponse, MessageResponse
from app.core.security import verify_password, get_password_hash
from app.core.exceptions import AppException

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=ApiResponse[UserRead])
def read_user_me(current_user: User = Depends(get_current_user)):
    """Retrieve profile and preferences of current user."""
    return ApiResponse(success=True, data=current_user)

@router.put("/me", response_model=ApiResponse[UserRead])
def update_user_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update personal details, address, and styling preferences."""
    if payload.name is not None:
        current_user.name = payload.name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip()
    if payload.profile_image is not None:
        current_user.profile_image = payload.profile_image

    if current_user.profile is None:
        current_user.profile = CustomerProfile(user_id=current_user.id)
        db.add(current_user.profile)

    if payload.address is not None:
        current_user.profile.address = payload.address
    if payload.city is not None:
        current_user.profile.city = payload.city
    if payload.pincode is not None:
        current_user.profile.pincode = payload.pincode
    if payload.preferences is not None:
        current_user.profile.preferences = payload.preferences

    db.commit()
    db.refresh(current_user)
    return ApiResponse(success=True, message="Profile updated successfully.", data=current_user)

@router.put("/me/password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change account password."""
    if not verify_password(payload.old_password, current_user.password_hash):
        raise AppException(status_code=400, message="Current password is incorrect.")

    if payload.new_password != payload.confirm_password:
        raise AppException(status_code=400, message="New passwords do not match.")

    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return MessageResponse(success=True, message="Password updated successfully.")
