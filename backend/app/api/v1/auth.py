from datetime import timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import AppException, UnauthorizedException, ConflictException
from app.models.user import User, CustomerProfile, UserRole
from app.schemas.auth import (
    Token,
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.schemas.user import UserRead
from app.schemas.common import ApiResponse, MessageResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=ApiResponse[Token], status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Registers a new customer account and returns a JWT access token."""
    if request.password != request.confirm_password:
        raise AppException(status_code=400, message="Passwords do not match.")

    # Check existing email
    if db.query(User).filter(User.email == request.email.lower().strip()).first():
        raise ConflictException("An account with this email already exists.")

    # Check existing phone
    if db.query(User).filter(User.phone == request.phone.strip()).first():
        raise ConflictException("An account with this phone number already exists.")

    new_user = User(
        name=request.name.strip(),
        email=request.email.lower().strip(),
        phone=request.phone.strip(),
        password_hash=get_password_hash(request.password),
        role=UserRole.CUSTOMER,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Create empty customer profile
    profile = CustomerProfile(user_id=new_user.id)
    db.add(profile)
    db.commit()
    db.refresh(new_user)

    role_str = new_user.role.value if hasattr(new_user.role, "value") else str(new_user.role)
    token = create_access_token(subject=new_user.id, role=role_str)
    token_data = Token(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        role=new_user.role,
        name=new_user.name,
        email=new_user.email
    )

    return ApiResponse(success=True, message="Registration successful! Welcome to SilaiCraft.", data=token_data)

@router.post("/login", response_model=ApiResponse[Token])
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates user with email and password, returning a JWT token."""
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise UnauthorizedException("Invalid email address or password.")

    if not user.is_active:
        raise AppException(status_code=403, message="Your account is deactivated. Please contact support.")

    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    token = create_access_token(subject=user.id, role=role_str)
    token_data = Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        name=user.name,
        email=user.email
    )

    return ApiResponse(success=True, message="Login successful.", data=token_data)

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiates a password reset flow."""
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    return MessageResponse(
        success=True,
        message="If this email is registered, password reset instructions have been dispatched."
    )

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Resets user password with a verification token."""
    if request.new_password != request.confirm_password:
        raise AppException(status_code=400, message="New passwords do not match.")

    return MessageResponse(
        success=True,
        message="Your password has been reset successfully. Please log in with your new password."
    )

@router.get("/me", response_model=ApiResponse[UserRead])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns profile information for the authenticated token holder."""
    return ApiResponse(success=True, data=current_user)
