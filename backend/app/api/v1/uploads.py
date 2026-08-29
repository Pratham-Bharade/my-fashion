from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from app.api.deps import get_optional_current_user
from app.models.user import User
from app.services.storage_service import storage_service
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/uploads", tags=["File Storage & Uploads"])

@router.post("/image", response_model=ApiResponse[dict], status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Form("general"),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Securely uploads an image file (JPG/PNG/WEBP up to 5MB).
    Allows authenticated users as well as prospective clients uploading design inspirations.
    Returns the file access URL path.
    """
    # Sanitize folder name
    sanitized_folder = "".join(c for c in folder if c.isalnum() or c in ("-", "_")).lower()
    if sanitized_folder not in ["designs", "custom_requests", "customers", "orders", "services", "general"]:
        sanitized_folder = "general"

    file_url = await storage_service.save_file(file=file, folder=sanitized_folder)
    return ApiResponse(
        success=True,
        message="Image uploaded successfully.",
        data={"url": file_url, "filename": file.filename}
    )
