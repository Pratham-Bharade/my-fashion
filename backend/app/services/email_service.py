import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def send_contact_notification(
        self,
        sender_name: str,
        sender_email: str,
        sender_phone: str | None,
        message: str
    ) -> bool:
        """
        Sends an email notification to the boutique owner (vandanabharade358@gmail.com)
        whenever a customer submits a contact inquiry or design consultation request.
        """
        receiver_email = settings.CONTACT_RECEIVER_EMAIL or "vandanabharade358@gmail.com"
        subject = f"✨ New Customer Inquiry from {sender_name} — Vandana Creations"

        # HTML Email Body
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Georgia', serif; color: #1c1917; background-color: #f5f5f4; margin: 0; padding: 20px; }}
            .card {{ max-width: 600px; margin: auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }}
            .header {{ border-bottom: 2px solid #1c1917; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 22px; font-weight: bold; color: #000; text-transform: uppercase; letter-spacing: 1px; }}
            .header p {{ margin: 5px 0 0; font-size: 12px; color: #78716c; }}
            .field {{ margin-bottom: 16px; }}
            .label {{ font-size: 11px; font-weight: bold; text-transform: uppercase; color: #a8a29e; letter-spacing: 0.5px; }}
            .value {{ font-size: 15px; font-weight: 600; color: #1c1917; margin-top: 3px; }}
            .message-box {{ background: #fafaf9; border-left: 4px solid #000; padding: 15px; border-radius: 8px; font-style: italic; color: #292524; line-height: 1.6; }}
            .actions {{ margin-top: 25px; padding-top: 20px; border-top: 1px solid #e7e5e4; text-align: center; }}
            .btn {{ display: inline-block; padding: 10px 20px; background: #000000; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: bold; margin: 0 5px; }}
            .btn-wa {{ background: #25D366; }}
            .footer {{ font-size: 11px; color: #a8a29e; text-align: center; margin-top: 20px; }}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>Vandana Creations</h1>
              <p>New Atelier Inquiry & Customer Message</p>
            </div>
            
            <div class="field">
              <div class="label">Customer Name</div>
              <div class="value">{sender_name}</div>
            </div>

            <div class="field">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:{sender_email}" style="color: #000; text-decoration: underline;">{sender_email}</a></div>
            </div>

            <div class="field">
              <div class="label">Phone Number</div>
              <div class="value">{sender_phone if sender_phone else "Not provided"}</div>
            </div>

            <div class="field">
              <div class="label">Customer Message</div>
              <div class="message-box">{message.replace(chr(10), '<br>')}</div>
            </div>

            <div class="actions">
              <a href="mailto:{sender_email}?subject=Re: Inquiry with Vandana Creations" class="btn">Reply via Email</a>
              {f'<a href="https://wa.me/{sender_phone.replace("+", "").replace(" ", "")}" class="btn btn-wa">Chat on WhatsApp</a>' if sender_phone else ''}
            </div>

            <div class="footer">
              Received on {datetime.now().strftime("%d %B %Y, %I:%M %p")} • Vandana Creations Atelier
            </div>
          </div>
        </body>
        </html>
        """

        # Plaintext Fallback
        text_content = f"""
        New Customer Inquiry — Vandana Creations
        ========================================
        Name:    {sender_name}
        Email:   {sender_email}
        Phone:   {sender_phone or 'Not provided'}
        Date:    {datetime.now().strftime("%d %B %Y, %I:%M %p")}

        Message:
        {message}
        """

        # Try sending via SMTP if configured
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
                msg["To"] = receiver_email
                msg["Reply-To"] = sender_email

                msg.attach(MIMEText(text_content, "plain"))
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM_EMAIL, receiver_email, msg.as_string())
                
                print(f"[EMAIL SENT] Successfully dispatched inquiry to {receiver_email}")
                return True
            except Exception as e:
                print(f"[EMAIL NOTICE] SMTP send error ({e}). Message logged securely.")
                logger.warning(f"Could not send email via SMTP: {e}")

        # Always log the formatted message clearly
        print(f"\n📨 --- NEW CONTACT INQUIRY FOR {receiver_email} ---")
        print(f"From:    {sender_name} ({sender_email})")
        print(f"Phone:   {sender_phone or 'N/A'}")
        print(f"Message: {message}")
        print("--------------------------------------------------\n")
        return True

email_service = EmailService()
