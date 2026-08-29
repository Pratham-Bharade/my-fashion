import sys
import argparse

# Ensure UTF-8 printing in Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from app.db.session import SessionLocal
from app.models.user import User, UserRole, CustomerProfile
from app.core.security import get_password_hash

def create_admin(name: str, email: str, phone: str, password: str):
    db = SessionLocal()
    try:
        # Check if user with this email already exists
        existing = db.query(User).filter(User.email == email.strip().lower()).first()
        if existing:
            print(f"[!] User with email '{email}' already exists.")
            existing.role = UserRole.ADMIN
            existing.hashed_password = get_password_hash(password)
            existing.name = name
            existing.phone = phone
            existing.is_active = True
            db.commit()
            print(f"[SUCCESS] User '{email}' is now an active ADMIN with the provided password.")
            return

        # Create new Admin User
        admin_user = User(
            name=name.strip(),
            email=email.strip().lower(),
            phone=phone.strip(),
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin_user)
        db.flush()

        profile = CustomerProfile(user_id=admin_user.id)
        db.add(profile)
        db.commit()

        print("=" * 60)
        print(f"[SUCCESS] Admin account created successfully!")
        print(f"    Name:      {name}")
        print(f"    Email:     {email}")
        print(f"    Phone:     {phone}")
        print(f"    Role:      ADMIN")
        print(f"    Login URL: http://localhost:5173/login")
        print(f"    Admin URL: http://localhost:5173/admin")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a new Admin account for SilaiCraft Couture")
    parser.add_argument("--name", default="Atelier Master", help="Full name of admin")
    parser.add_argument("--email", default="admin@silaicraft.com", help="Admin login email")
    parser.add_argument("--phone", default="+919876543210", help="Admin phone number")
    parser.add_argument("--password", default="Admin@123456", help="Admin login password")

    args = parser.parse_args()
    create_admin(args.name, args.email, args.phone, args.password)
