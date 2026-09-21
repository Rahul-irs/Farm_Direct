import smtplib
from email.message import EmailMessage
from flask import current_app


def send_otp_email(recipient, subject, code, purpose):
    server = current_app.config.get('MAIL_SERVER')
    port = current_app.config.get('MAIL_PORT')
    username = current_app.config.get('MAIL_USERNAME')
    password = current_app.config.get('MAIL_PASSWORD')
    if password:
        password = ''.join(password.split())
    sender = current_app.config.get('MAIL_DEFAULT_SENDER') or username

    if not server or not port or not sender or not username or not password:
        current_app.logger.warning(
            'SMTP credentials are not configured; returning without sending the OTP email. '
            'Use a valid MAIL_USERNAME and MAIL_PASSWORD in production.'
        )
        return False

    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = sender
    message['To'] = recipient
    message.set_content(
        f'Your FarmDirect AI {purpose} code is {code}. It expires in 10 minutes.\n\n'
        'If you did not request this code, you can safely ignore this email.'
    )

    try:
        with smtplib.SMTP(server, port, timeout=current_app.config.get('MAIL_TIMEOUT', 10)) as smtp:
            if current_app.config.get('MAIL_USE_TLS'):
                smtp.starttls()
            if username and password:
                smtp.login(username, password)
            smtp.send_message(message)
    except (smtplib.SMTPException, OSError, ValueError, RuntimeError) as exc:
        current_app.logger.warning('OTP email delivery failed; continuing in demo mode: %s', exc)
        return False
    return True
