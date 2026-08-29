from typing import Optional
from pydantic import EmailStr, Field
from app.schemas.common import BaseSchema
from app.models.user import UserRole

class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: UserRole
    name: str
    email: str

class LoginRequest(BaseSchema):
    email: EmailStr
    password: str = Field(..., min_length=6)

class RegisterRequest(BaseSchema):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9+\-\s()]{7,20}$")
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

class ForgotPasswordRequest(BaseSchema):
    email: EmailStr

class ResetPasswordRequest(BaseSchema):
    token: str
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

class ChangePasswordRequest(BaseSchema):
    old_password: str
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
