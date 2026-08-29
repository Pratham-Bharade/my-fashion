import sys
import argparse
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def change_admin(email, password, name="Vandana Bharade", phone="+919322228426"):
    db = SessionLocal()
    try:
        # Check if an existing admin user exists
        admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        
        if admin:
            print(f"[*] Found existing Admin: {admin.email}")
            admin.name = name
            admin.email = email
            admin.phone = phone
            admin.password_hash = get_password_hash(password)
            admin.is_active = True
            db.commit()
            print(f"[SUCCESS] Admin account updated successfully!")
        else:
            # Check if email is used by a customer
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                existing_user.role = UserRole.ADMIN
                existing_user.password_hash = get_password_hash(password)
                existing_user.name = name
                existing_user.phone = phone
                db.commit()
                print(f"[SUCCESS] User {email} upgraded to Admin successfully!")
            else:
                admin = User(
                    name=name,
                    email=email,
                    phone=phone,
                    password_hash=get_password_hash(password),
                    role=UserRole.ADMIN,
                    is_active=True
                )
                db.add(admin)
                db.commit()
                print(f"[SUCCESS] New Admin account created successfully!")
        
        print("\n--- ADMIN CREDENTIALS ---")
        print(f"Name:     {name}")
        print(f"Email:    {email}")
        print(f"Phone:    {phone}")
        print(f"Password: {password}")
        print("-------------------------\n")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to update admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Change Admin Account Credentials")
    parser.add_argument("--email", default="vandanabharade358@gmail.com", help="Admin Email")
    parser.add_argument("--password", default="Admin@123456", help="Admin Password")
    parser.add_argument("--name", default="Vandana Bharade (Master Designer)", help="Admin Name")
    parser.add_argument("--phone", default="+919322228426", help="Admin Phone")
    
    args = parser.parse_args()
    change_admin(args.email, args.password, args.name, args.phone)
