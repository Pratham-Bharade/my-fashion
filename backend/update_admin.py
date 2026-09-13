import sys
import argparse
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def update_or_create_admin(name=None, email=None, password=None, phone=None):
    db: Session = SessionLocal()
    try:
        # Find existing admin user
        admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        
        if not admin:
            # Check by email if role wasn't set to ADMIN
            if email:
                admin = db.query(User).filter(User.email == email).first()

        if admin:
            print(f"[*] Found existing admin account (ID: {admin.id}, Current Email: {admin.email})")
            if name:
                admin.name = name.strip()
            if email:
                admin.email = email.strip().lower()
            if phone:
                admin.phone = phone.strip()
            if password:
                admin.password_hash = get_password_hash(password)
            admin.role = UserRole.ADMIN
            admin.is_active = True
            db.commit()
            db.refresh(admin)
            print("\n[+] SUCCESS! Admin account updated successfully:")
        else:
            print("[*] No existing admin found. Creating new Admin user...")
            if not email or not password:
                print("[-] Error: Email and password are required to create a new admin.")
                return
            
            admin = User(
                name=name or "Vandana Admin",
                email=email.strip().lower(),
                phone=phone or "+919322228426",
                password_hash=get_password_hash(password),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("\n[+] SUCCESS! Admin account created successfully:")

        print(f"  • Name     : {admin.name}")
        print(f"  • Email    : {admin.email}")
        print(f"  • Phone    : {admin.phone}")
        print(f"  • Role     : {admin.role}")
        print(f"  • Password : {'(Updated)' if password else '(Unchanged)'}")
    except Exception as e:
        db.rollback()
        print(f"[-] Failed to update admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update or Create Admin User Credentials")
    parser.add_argument("--name", help="Admin Full Name / Username")
    parser.add_argument("--email", help="Admin Email Address (Gmail)")
    parser.add_argument("--password", help="Admin New Password")
    parser.add_argument("--phone", help="Admin Phone Number")
    
    args = parser.parse_args()

    # If no arguments passed, prompt interactively
    if not (args.name or args.email or args.password or args.phone):
        print("=== Vandana Creations - Admin Credential Updater ===")
        name = input("Enter new Admin Name (or press Enter to keep current): ").strip()
        email = input("Enter new Admin Email/Gmail (or press Enter to keep current): ").strip()
        password = input("Enter new Admin Password (or press Enter to keep current): ").strip()
        phone = input("Enter new Admin Phone (or press Enter to keep current): ").strip()
        update_or_create_admin(
            name=name if name else None,
            email=email if email else None,
            password=password if password else None,
            phone=phone if phone else None
        )
    else:
        update_or_create_admin(
            name=args.name,
            email=args.email,
            password=args.password,
            phone=args.phone
        )
