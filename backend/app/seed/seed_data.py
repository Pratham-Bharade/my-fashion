import sys
from datetime import datetime, date, time, timedelta, timezone

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base_class import Base
from app.models.service import Service, ServiceCategory
from app.models.design import Design, DesignCategory
from app.models.settings import BusinessSettings

def seed_db(db: Session):
    print("[*] Starting database seeding...")

    # 1. Business Settings
    settings_record = db.query(BusinessSettings).first()
    if not settings_record:
        settings_record = BusinessSettings(
            business_name="Vandana Creations",
            logo="/logo.png",
            phone="+91 93222 28426",
            email="contact@vandanacreations.com",
            address="14, Fashion Street, Near Heritage Circle, Pune, Maharashtra 411001",
            whatsapp="+919322228426",
            working_hours={
                "monday": {"open": "10:00", "close": "20:00", "is_closed": False},
                "tuesday": {"open": "10:00", "close": "20:00", "is_closed": False},
                "wednesday": {"open": "10:00", "close": "20:00", "is_closed": False},
                "thursday": {"open": "10:00", "close": "20:00", "is_closed": False},
                "friday": {"open": "10:00", "close": "20:00", "is_closed": False},
                "saturday": {"open": "10:00", "close": "20:00", "is_closed": False},
                "sunday": {"open": "11:00", "close": "17:00", "is_closed": False}
            },
            holidays=["2026-08-15", "2026-10-02", "2026-11-08"],
            social_links={
                "instagram": "https://instagram.com/vandanacreations",
                "facebook": "https://facebook.com/vandanacreations",
                "youtube": "https://youtube.com/@vandanacreations",
                "pinterest": "https://pinterest.com/vandanacreations"
            },
            about_text="With over 15 years of dedicated bespoke tailoring craftsmanship, Vandana Creations specializes in sarees, bridal couture, royal designer blouses, and contemporary kurtis. Every stitch is crafted with passion for a graceful, modern, and stylish silhouette."
        )
        db.add(settings_record)
        print("  [+] Business Settings created (Vandana Creations)")
    else:
        settings_record.business_name = "Vandana Creations"
        settings_record.logo = "/logo.png"
        settings_record.email = "contact@vandanacreations.com"
        settings_record.phone = "+91 93222 28426"
        settings_record.whatsapp = "+919322228426"

    # 2. Services
    if db.query(Service).count() == 0:
        services_data = [
            {
                "name": "Designer & Bridal Blouse Stitching",
                "category": ServiceCategory.BLOUSE,
                "description": "Customized neckline, princess cut, padded with cotton canvas lining, piping, and 2-inch alter margin.",
                "price": 850.0,
                "estimated_days": 4,
                "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
                "is_active": True
            },
            {
                "name": "Custom Saree & Bridal Lehenga Stitching",
                "category": ServiceCategory.TRADITIONAL,
                "description": "Multi-kalidar lehenga with heavy cancan attachment, designer choli, and embroidered dupatta border.",
                "price": 3200.0,
                "estimated_days": 10,
                "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
                "is_active": True
            },
            {
                "name": "Salwar Suit & Anarkali Custom Tailoring",
                "category": ServiceCategory.SALWAR_SUIT,
                "description": "Perfect fitting Punjabi suits, Pakistani floor-length Anarkalis, pant suits with customized neck and sleeve patterns.",
                "price": 1100.0,
                "estimated_days": 5,
                "image": "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&q=80",
                "is_active": True
            },
            {
                "name": "Contemporary Kurti & Tunic Stitching",
                "category": ServiceCategory.KURTI,
                "description": "Straight-cut, A-line, Alia cut, and asymmetric designer kurtis tailored to personal comfort and style.",
                "price": 650.0,
                "estimated_days": 3,
                "image": "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80",
                "is_active": True
            },
            {
                "name": "Evening Gown & Reception Dress Tailoring",
                "category": ServiceCategory.WESTERN,
                "description": "Bespoke floor-length drape gowns, indo-western party wear with built-in corsets and flowy silhouettes.",
                "price": 2800.0,
                "estimated_days": 8,
                "image": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
                "is_active": True
            },
            {
                "name": "Boutique Alterations & Size Restyling",
                "category": ServiceCategory.ALTERATIONS,
                "description": "Professional fitting adjustment, zip replacement, sleeve addition, neckline redesign, and waist resizing.",
                "price": 250.0,
                "estimated_days": 2,
                "image": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
                "is_active": True
            }
        ]
        for s_data in services_data:
            svc = Service(**s_data)
            db.add(svc)
        print("  [+] Core Tailoring Services seeded")

    # 3. Gallery Designs
    if db.query(Design).count() == 0:
        designs_data = [
            {
                "title": "Royal Velvet Aari Work Bridal Blouse",
                "category": DesignCategory.BRIDAL,
                "description": "Heavy handcrafted zardosi and aari embroidery on midnight blue velvet with sweetheart neckline and latkan back.",
                "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
                "price": 2400.0,
                "tags": ["bridal", "velvet", "zardosi", "aari", "sweetheart-neck"],
                "is_active": True
            },
            {
                "title": "Pastel Pink Floral Embroidered Lehenga",
                "category": DesignCategory.LEHENGA,
                "description": "Georgette lehenga with intricate thread and sequin floral work, paired with an off-shoulder blouse.",
                "image": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&q=80",
                "price": 5500.0,
                "tags": ["lehenga", "pastel", "reception", "floral", "cancan"],
                "is_active": True
            },
            {
                "title": "Contemporary High-Neck Designer Kurti",
                "category": DesignCategory.KURTI,
                "description": "Chanderi silk kurti with button placket, bell sleeves and asymmetrical front slit.",
                "image": "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80",
                "price": 950.0,
                "tags": ["kurti", "high-neck", "chanderi", "fusion"],
                "is_active": True
            },
            {
                "title": "Maroon Draped Cocktail Gown",
                "category": DesignCategory.GOWN,
                "description": "Floor-sweeping satin drape gown with embroidered waist cinch and cowl neckline.",
                "image": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
                "price": 3500.0,
                "tags": ["gown", "cocktail", "satin", "party"],
                "is_active": True
            },
            {
                "title": "Mirror Work Festive Choli",
                "category": DesignCategory.EMBROIDERY,
                "description": "Authentic Gujarat kutchi mirror work on silk cotton with colorful tassel tie-ups.",
                "image": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
                "price": 1800.0,
                "tags": ["mirror-work", "navratri", "festive", "traditional"],
                "is_active": True
            }
        ]
        for d_data in designs_data:
            des = Design(**d_data)
            db.add(des)
        print("  [+] Gallery Designs seeded")

    db.commit()
    print("[OK] Database seeding completed successfully!")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
