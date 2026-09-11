import smtplib
from email.message import EmailMessage
from flask import current_app


def send_otp_email(recipient, subject, code, purpose):
    server = current_app.config['MAIL_SERVER']
    port = current_app.config['MAIL_PORT']
    username = current_app.config.get('MAIL_USERNAME')
    password = current_app.config.get('MAIL_PASSWORD')
    sender = current_app.config.get('MAIL_DEFAULT_SENDER') or username
    if not sender:
        raise RuntimeError('MAIL_DEFAULT_SENDER or MAIL_USERNAME must be configured')

    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = sender
    message['To'] = recipient
    message.set_content(
        f'Your FarmDirect AI {purpose} code is {code}. It expires in 10 minutes.\n\n'
        'If you did not request this code, you can safely ignore this email.'
    )

    with smtplib.SMTP(server, port, timeout=15) as smtp:
        if current_app.config['MAIL_USE_TLS']:
            smtp.starttls()
        if username and password:
            smtp.login(username, password)
        smtp.send_message(message)
