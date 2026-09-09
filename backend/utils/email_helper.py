# email_helper.py: Transactional SMTP sender with mock fallback logging
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.config import Config

# Ensure instance folder exists for mock logging
instance_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance')
if not os.path.exists(instance_dir):
    os.makedirs(instance_dir)

MOCK_EMAIL_LOG = os.path.join(instance_dir, 'mock_emails.log')

def send_email(recipient_email, subject, body_html, body_text=""):
    """
    Sends an email using configured SMTP parameters.
    If details are missing, defaults to logging to instance/mock_emails.log.
    """
    print(f"Attempting to send email to {recipient_email} - Subject: {subject}")
    
    # Check if SMTP parameters are provided
    if not Config.SMTP_USER or not Config.SMTP_PASSWORD or not Config.SENDER_EMAIL:
        # Fall back to mock logging
        log_msg = f"""========================================
[MOCK EMAIL SENT]
Timestamp: {os.path.getmtime(MOCK_EMAIL_LOG) if os.path.exists(MOCK_EMAIL_LOG) else 'Now'}
To: {recipient_email}
From: mock-system@support-analysis.com
Subject: {subject}
----------------------------------------
Text Content:
{body_text or 'No text body'}

HTML Content:
{body_html}
========================================
\n"""
        with open(MOCK_EMAIL_LOG, 'a', encoding='utf-8') as f:
            f.write(log_msg)
        print(f"[MOCK EMAIL LOGGED] Details saved to backend/instance/mock_emails.log")
        return True

    # Send using real SMTP
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = Config.SENDER_EMAIL
        msg['To'] = recipient_email

        # Attach text and html versions
        if body_text:
            msg.attach(MIMEText(body_text, 'plain'))
        msg.attach(MIMEText(body_html, 'html'))

        # Standard SMTP connection
        server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
        server.starttls()
        server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
        server.sendmail(Config.SENDER_EMAIL, recipient_email, msg.as_string())
        server.quit()
        print(f"Email successfully sent to {recipient_email} via SMTP.")
        return True
    except Exception as e:
        print(f"Failed to send email via SMTP: {str(e)}")
        # Log to mock log file as a fail-safe
        fail_log = f"[SMTP FAILURE LOG - ERROR: {str(e)}]\nTo: {recipient_email}\nSubject: {subject}\nHTML:\n{body_html}\n\n"
        with open(MOCK_EMAIL_LOG, 'a', encoding='utf-8') as f:
            f.write(fail_log)
        return False
