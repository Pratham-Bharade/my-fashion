from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_admin
from app.models.settings import BusinessSettings
from app.models.user import User
from app.schemas.settings import BusinessSettingsRead, BusinessSettingsUpdate
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/business-settings", tags=["Business Configuration"])

@router.get("", response_model=ApiResponse[BusinessSettingsRead])
def get_business_settings(db: Session = Depends(get_db)):
    """Public: Retrieve boutique contact info, working hours, and social channels."""
    settings_record = db.query(BusinessSettings).first()
    if not settings_record:
        # Fallback default if not seeded yet
        settings_record = BusinessSettings(
            business_name="SilaiCraft Couture & Tailoring",
            phone="+91 98765 43210",
            email="contact@silaicraft.com",
            address="14, Fashion Street, Near Heritage Circle, Pune",
            whatsapp="+919876543210"
        )
        db.add(settings_record)
        db.commit()
        db.refresh(settings_record)

    return ApiResponse(success=True, data=settings_record)

@router.put("", response_model=ApiResponse[BusinessSettingsRead])
def update_business_settings(
    payload: BusinessSettingsUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin: Update business profile, working hours, holidays, and about details."""
    settings_record = db.query(BusinessSettings).first()
    if not settings_record:
        settings_record = BusinessSettings(
            business_name="SilaiCraft Couture & Tailoring",
            phone="+91 98765 43210",
            email="contact@silaicraft.com",
            address="14, Fashion Street, Near Heritage Circle, Pune"
        )
        db.add(settings_record)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings_record, field, value)

    db.commit()
    db.refresh(settings_record)
    return ApiResponse(success=True, message="Business settings updated successfully.", data=settings_record)
