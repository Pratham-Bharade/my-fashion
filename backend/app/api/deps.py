from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    """Validates the JWT bearer token and returns the authenticated active user."""
    if not token:
        raise UnauthorizedException("Authentication token required.")

    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token.")

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Malformed authentication token.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException("User belonging to this token no longer exists.")

    if not user.is_active:
        raise ForbiddenException("User account is inactive or disabled.")

    return user

def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Enforces that the current authenticated user has ADMIN role."""
    role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role_str != UserRole.ADMIN.value:
        raise ForbiddenException("Administrator privileges required to access this resource.")
    return current_user

def get_optional_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    """Returns the authenticated user if a valid token is provided, otherwise None."""
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()
