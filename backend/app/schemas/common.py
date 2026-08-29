from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class ApiResponse(BaseSchema, Generic[T]):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[T] = None

class PaginatedResponse(BaseSchema, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    total_pages: int

class MessageResponse(BaseSchema):
    success: bool = True
    message: str
