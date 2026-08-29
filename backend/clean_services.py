from app.db.session import SessionLocal
from app.models.service import Service, ServiceCategory

def clean_and_deduplicate_services():
    db = SessionLocal()
    try:
        # Define clean, distinct services (1 per category)
        clean_services = [
            {
                "name": "Designer & Bridal Blouse Stitching",
                "category": ServiceCategory.BLOUSE,
                "description": "Custom neckline, princess cut, padded with cotton canvas lining, piping, and 2-inch alter margin.",
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
                "name": "A-Line & Straight Cut Kurti",
                "category": ServiceCategory.KURTIS,
                "description": "Casual and festive kurtis tailored with sleeve, yoke, and neckline styling of your choice.",
                "price": 550.0,
                "estimated_days": 3,
                "image": "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80",
                "is_active": True
            },
            {
                "name": "Floor-Length Anarkali Gown",
                "category": ServiceCategory.DRESSES,
                "description": "Flared floor-length gown with yoke detailing and custom pleated flare.",
                "price": 2200.0,
                "estimated_days": 7,
                "image": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
                "is_active": True
            },
            {
                "name": "Garment Alteration & Fitting",
                "category": ServiceCategory.ALTERATIONS,
                "description": "Precision fitting adjustments, waist reduction, length shortening, and sleeve alterations.",
                "price": 250.0,
                "estimated_days": 2,
                "image": "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&q=80",
                "is_active": True
            },
        ]

        # For safety with foreign keys: update existing services by category and remove extra ones
        existing = db.query(Service).all()
        by_category = {}
        for s in existing:
            cat = s.category.value if hasattr(s.category, 'value') else str(s.category)
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(s)

        for data in clean_services:
            cat_str = data["category"].value
            if cat_str in by_category and len(by_category[cat_str]) > 0:
                primary = by_category[cat_str][0]
                primary.name = data["name"]
                primary.description = data["description"]
                primary.price = data["price"]
                primary.estimated_days = data["estimated_days"]
                primary.image = data["image"]
                primary.is_active = True
                
                # Delete any extra duplicates in this category
                for extra in by_category[cat_str][1:]:
                    try:
                        db.delete(extra)
                    except Exception:
                        extra.is_active = False
            else:
                new_s = Service(**data)
                db.add(new_s)

        db.commit()
        print("[SUCCESS] Services deduplicated successfully! Exactly 1 unique service per category.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clean_and_deduplicate_services()
