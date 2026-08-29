import sys
from app.services.email_service import email_service
from app.core.config import settings

def test_send():
    print("[*] Testing Email Dispatch...")
    print(f"  SMTP Host:       {settings.SMTP_HOST}:{settings.SMTP_PORT}")
    print(f"  SMTP User:       {settings.SMTP_USER}")
    print(f"  Recipient Email: {settings.CONTACT_RECEIVER_EMAIL}")
    print(f"  SMTP Password:   {'[Configured]' if settings.SMTP_PASSWORD else '[NOT SET - Please add App Password to backend/.env]'}")
    
    if not settings.SMTP_PASSWORD:
        print("\n[!] To send real emails to your Gmail inbox, Google requires a 16-letter Gmail App Password.")
        print("    1. Go to: https://myaccount.google.com/apppasswords")
        print("    2. Generate an App Password for 'Vandana Creations'")
        print("    3. Paste it in backend/.env under SMTP_PASSWORD=your_password")
        return

    success = email_service.send_contact_notification(
        sender_name="Priya Sharma (Test Client)",
        sender_email="priya.sharma@example.com",
        sender_phone="+91 98765 43210",
        message="Hello! This is a test message from Vandana Creations website to verify that emails arrive in your Gmail inbox properly."
    )

    if success:
        print(f"\n[SUCCESS] Test email dispatched to {settings.CONTACT_RECEIVER_EMAIL}! Check your Gmail inbox.")
    else:
        print("\n[ERROR] Failed to send email. Check credentials.")

if __name__ == "__main__":
    test_send()
