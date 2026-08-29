from app.db.session import SessionLocal
from app.models.service import Service, ServiceCategory
from app.models.design import Design, DesignCategory

def update_perfect_images():
    db = SessionLocal()
    try:
        # 1. Services with precisely matched high-res images
        services_map = {
            "BLOUSE": {
                "name": "Designer & Bridal Blouse Stitching",
                "category": ServiceCategory.BLOUSE,
                "description": "Customized neckline, princess cut, padded with cotton canvas lining, piping, and 2-inch alter margin.",
                "price": 850.0,
                "estimated_days": 4,
                "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
                "is_active": True
            },
            "TRADITIONAL": {
                "name": "Custom Saree & Bridal Lehenga Stitching",
                "category": ServiceCategory.TRADITIONAL,
                "description": "Multi-kalidar lehenga with heavy cancan attachment, designer choli, and embroidered dupatta border.",
                "price": 3200.0,
                "estimated_days": 10,
                "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80",
                "is_active": True
            },
            "KURTIS": {
                "name": "A-Line & Straight Cut Kurti",
                "category": ServiceCategory.KURTIS,
                "description": "Casual and festive kurtis tailored with sleeve, yoke, and neckline styling of your choice.",
                "price": 550.0,
                "estimated_days": 3,
                "image": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80",
                "is_active": True
            },
            "DRESSES": {
                "name": "Floor-Length Anarkali Gown",
                "category": ServiceCategory.DRESSES,
                "description": "Flared floor-length gown with yoke detailing and custom pleated flare.",
                "price": 2200.0,
                "estimated_days": 7,
                "image": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=700&auto=format&fit=crop&q=80",
                "is_active": True
            },
            "ALTERATIONS": {
                "name": "Garment Alteration & Fitting",
                "category": ServiceCategory.ALTERATIONS,
                "description": "Precision fitting adjustments, waist reduction, length shortening, and sleeve alterations.",
                "price": 250.0,
                "estimated_days": 2,
                "image": "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=700&auto=format&fit=crop&q=80",
                "is_active": True
            }
        }

        for cat_key, s_data in services_map.items():
            svc = db.query(Service).filter(Service.category == getattr(ServiceCategory, cat_key)).first()
            if svc:
                svc.name = s_data["name"]
                svc.description = s_data["description"]
                svc.price = s_data["price"]
                svc.estimated_days = s_data["estimated_days"]
                svc.image = s_data["image"]
                svc.is_active = True
            else:
                db.add(Service(**s_data))

        # 2. Update designs images to match their titles and categories
        designs = db.query(Design).all()
        design_images = [
            ("https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80", "Emerald Velvet Deep Back Blouse"),
            ("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80", "Royal Gold Aari Embroidered Bridal Blouse"),
            ("https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=700&auto=format&fit=crop&q=80", "Pastel Pink Floral 24-Kali Lehenga"),
            ("https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80", "Contemporary High-Neck Designer Kurti"),
            ("https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&auto=format&fit=crop&q=80", "Maroon Draped Cocktail Gown"),
            ("https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=700&auto=format&fit=crop&q=80", "Mirror Work Festive Choli"),
        ]

        for i, d in enumerate(designs):
            if i < len(design_images):
                d.image = design_images[i][0]
                d.title = design_images[i][1]

        db.commit()
        print("[SUCCESS] All service & design images matched and updated!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_perfect_images()
