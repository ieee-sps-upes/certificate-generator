import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD

def send_otp_email(recipient_email, otp):
    if not SMTP_USERNAME or SMTP_USERNAME == "your_email@gmail.com":
        print(f"⚠️ SMTP not configured. Mocking email to {recipient_email}. OTP is: {otp}")
        return True
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = recipient_email
        msg['Subject'] = "Your IEEE Certificate OTP"
        
        body = f"""
        Hello,
        
        Your OTP to download your certificate is: {otp}
        
        This OTP is valid for 10 minutes.
        
        Best regards,
        IEEE Chapter
        """
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"OTP email sent to {recipient_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {recipient_email}: {str(e)}")
        # Print OTP to console as fallback during development
        print(f"FALLBACK - OTP for {recipient_email} is: {otp}")
        return False
