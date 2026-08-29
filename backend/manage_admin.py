import sys
import argparse

# Ensure UTF-8 in Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from app.db.session import SessionLocal
from app.models.user import User, UserRole, CustomerProfile
from app.core.security import get_password_hash

def list_admins():
    db = SessionLocal()
    try:
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        print("\n" + "=" * 65)
        print("  ACTIVE ADMIN ACCOUNTS IN SILAICRAFT")
        print("=" * 65)
        if not admins:
            print("  No admin accounts found.")
        for a in admins:
            status = "Active" if a.is_active else "Deactivated"
            print(f"  • Name:  {a.name:<20} Email: {a.email:<28} [{status}]")
        print("=" * 65 + "\n")
    finally:
        db.close()

def change_admin_credentials(old_email: str, new_name: str = None, new_email: str = None, new_password: str = None, new_phone: str = None):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == old_email.strip().lower()).first()
        if not user:
            print(f"[X] Error: No user found with email '{old_email}'.")
            return

        if new_email and new_email.strip().lower() != old_email.strip().lower():
            # Check collision
            existing = db.query(User).filter(User.email == new_email.strip().lower()).first()
            if existing and existing.id != user.id:
                print(f"[X] Error: An account with email '{new_email}' already exists.")
                return
            user.email = new_email.strip().lower()

        if new_name:
            user.name = new_name.strip()
        if new_phone:
            user.phone = new_phone.strip()
        if new_password:
            user.hashed_password = get_password_hash(new_password)

        user.role = UserRole.ADMIN
        user.is_active = True
        db.commit()

        print("\n" + "=" * 65)
        print("[SUCCESS] Admin credentials updated successfully!")
        print(f"    Name:      {user.name}")
        print(f"    Email:     {user.email}")
        print(f"    Phone:     {user.phone}")
        print(f"    Role:      ADMIN")
        print("=" * 65 + "\n")
    except Exception as e:
        db.rollback()
        print(f"[X] Error updating admin: {e}")
    finally:
        db.close()

def demote_admin(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if not user:
            print(f"[X] Error: User '{email}' not found.")
            return

        user.role = UserRole.CUSTOMER
        db.commit()
        print(f"[SUCCESS] User '{email}' has been demoted to a regular CUSTOMER.")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manage & Change Admin Accounts for SilaiCraft Couture")
    parser.add_argument("--action", choices=["list", "update", "demote"], default="update", help="Action to perform")
    parser.add_argument("--old-email", default="admin@silaicraft.com", help="Current admin email to modify")
    parser.add_argument("--new-email", help="New admin email address")
    parser.add_argument("--new-name", help="New admin full name")
    parser.add_argument("--new-password", help="New admin password")
    parser.add_argument("--new-phone", help="New admin phone number")

    args = parser.parse_args()

    if args.action == "list":
        list_admins()
    elif args.action == "demote":
        demote_admin(args.old_email)
    elif args.action == "update":
        change_admin_credentials(
            old_email=args.old_email,
            new_name=args.new_name,
            new_email=args.new_email,
            new_password=args.new_password,
            new_phone=args.new_phone,
        )
