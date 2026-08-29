from typing import Any, Optional, Dict
from fastapi import HTTPException, status

class AppException(HTTPException):
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        message: str = "An error occurred",
        data: Optional[Any] = None
    ):
        super().__init__(
            status_code=status_code,
            detail={"success": False, "message": message, "data": data}
        )

class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource", message: Optional[str] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=message or f"{resource} not found"
        )

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message
        )

class ForbiddenException(AppException):
    def __init__(self, message: str = "You do not have permission to access this resource"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message
        )

class ConflictException(AppException):
    def __init__(self, message: str = "A conflict occurred with an existing resource"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            message=message
        )

class ValidationException(AppException):
    def __init__(self, message: str = "Validation error", data: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            message=message,
            data=data
        )
