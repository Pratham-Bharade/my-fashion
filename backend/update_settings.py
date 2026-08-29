from app.db.session import SessionLocal
from app.models.settings import BusinessSettings

def update_contact_details():
    db = SessionLocal()
    try:
        settings = db.query(BusinessSettings).first()
        if not settings:
            settings = BusinessSettings(
                business_name="Vandana Creations",
                logo="/logo.png",
                phone="+91 93222 28426",
                email="vandanabharade358@gmail.com",
                address="Moshi, Pune, Maharashtra 412105",
                whatsapp="9322228426",
                working_hours={
                    "monday": {"open": "10:00", "close": "20:00", "is_closed": False},
                    "tuesday": {"open": "10:00", "close": "20:00", "is_closed": False},
                    "wednesday": {"open": "10:00", "close": "20:00", "is_closed": False},
                    "thursday": {"open": "10:00", "close": "20:00", "is_closed": False},
                    "friday": {"open": "10:00", "close": "20:00", "is_closed": False},
                    "saturday": {"open": "10:00", "close": "20:00", "is_closed": False},
                    "sunday": {"open": "11:00", "close": "17:00", "is_closed": False}
                }
            )
            db.add(settings)
        else:
            settings.business_name = "Vandana Creations"
            settings.phone = "+91 93222 28426"
            settings.email = "vandanabharade358@gmail.com"
            settings.address = "Moshi, Pune, Maharashtra 412105"
            settings.whatsapp = "9322228426"

        db.commit()
        print("[SUCCESS] Business settings updated with Moshi address, phone 9322228426, and email vandanabharade358@gmail.com")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_contact_details()
