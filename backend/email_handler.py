import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD

# ── Persistent SMTP connection ────────────────────────────────────────────────
# A new TCP+TLS handshake to Gmail costs 2-4 seconds every time.
# We keep one connection alive and reconnect only when it drops.
_smtp_lock   = threading.Lock()
_smtp_client = None

def _get_smtp():
    """Return a live SMTP connection, reconnecting if needed."""
    global _smtp_client
    try:
        # NOOP is the lightest way to check if the connection is still alive
        if _smtp_client is not None:
            status = _smtp_client.noop()
            if status[0] == 250:
                return _smtp_client
    except Exception:
        pass  # connection is dead, fall through to reconnect

    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
    server.starttls()
    server.login(SMTP_USERNAME, SMTP_PASSWORD)
    _smtp_client = server
    return _smtp_client


def send_otp_email(recipient_email, otp):
    if not SMTP_USERNAME or SMTP_USERNAME == "your_email@gmail.com":
        print(f"[MOCK] OTP for {recipient_email}: {otp}")
        return True

    msg = MIMEMultipart()
    msg['From']    = SMTP_USERNAME
    msg['To']      = recipient_email
    msg['Subject'] = "Your IEEE SPS UPES Certificate — Verification Code"

    body = f"""\
Hello,

Your one-time verification code to download your IEEE certificate is:

    {otp}

This code is valid for 10 minutes. Do not share it with anyone.

Best regards,
IEEE SPS UPES Chapter
"""
    msg.attach(MIMEText(body, 'plain'))

    with _smtp_lock:
        try:
            server = _get_smtp()
            server.send_message(msg)
            print(f"[EMAIL] OTP sent to {recipient_email}")
            return True
        except Exception as e:
            # Try once more with a fresh connection
            try:
                global _smtp_client
                _smtp_client = None
                server = _get_smtp()
                server.send_message(msg)
                print(f"[EMAIL] OTP sent to {recipient_email} (after reconnect)")
                return True
            except Exception as e2:
                print(f"[EMAIL] Failed to send to {recipient_email}: {e2}")
                print(f"[FALLBACK] OTP for {recipient_email} is: {otp}")
                return False
