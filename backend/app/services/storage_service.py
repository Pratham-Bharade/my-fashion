import os
import uuid
import shutil
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import ValidationException

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".webm", ".mov", ".ogg", ".m4v"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/ogg",
    "video/x-m4v"
}

class StorageService:
    def __init__(self, base_upload_dir: Optional[str] = None):
        self.base_upload_dir = base_upload_dir or settings.UPLOAD_DIR
        os.makedirs(self.base_upload_dir, exist_ok=True)

    async def save_file(self, file: UploadFile, folder: str = "general") -> str:
        """
        Validates and saves an uploaded image or video file safely.
        Returns the relative URL path to access the file.
        """
        # Validate MIME type / prefix
        content_type = file.content_type or "application/octet-stream"
        is_allowed_mime = content_type in ALLOWED_MIME_TYPES or content_type.startswith("image/") or content_type.startswith("video/")

        # Validate extension
        _, ext = os.path.splitext(file.filename or "")
        ext = ext.lower()
        if not ext and content_type.startswith("video/"):
            ext = ".mp4"
        elif not ext and content_type.startswith("image/"):
            ext = ".jpg"

        if ext not in ALLOWED_EXTENSIONS and not is_allowed_mime:
            raise ValidationException(
                f"Unsupported file type '{content_type}'. Allowed types: JPG, PNG, WEBP, MP4, WEBM, MOV."
            )

        # Check file size
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_size_bytes:
            raise ValidationException(
                f"File size exceeds the maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        # Generate unique sanitized filename
        target_dir = os.path.join(self.base_upload_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        unique_filename = f"{uuid.uuid4()}{ext}"
        destination_path = os.path.join(target_dir, unique_filename)

        # Write to disk
        with open(destination_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return standardized URL path
        return f"/uploads/{folder}/{unique_filename}"

storage_service = StorageService()
