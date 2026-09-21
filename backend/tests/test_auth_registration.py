from app import create_app, db
from app.models.user import User
from werkzeug.security import generate_password_hash
from app.services import mail


def test_registration_fails_without_smtp_credentials(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True, MAIL_SERVER='smtp.example.com', MAIL_PORT=587, MAIL_USE_TLS=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()

    response = client.post('/api/auth/register', json={
        'full_name': 'No SMTP User',
        'email': 'nosmtp@test.com',
        'password': 'password123',
        'role': 'consumer',
    })

    assert response.status_code == 503
    assert response.get_json()['success'] is False


def test_registration_supports_all_public_roles(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    monkeypatch.setattr('app.routes.auth.send_otp_email', lambda *args: None)
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()

    roles = ('consumer', 'farmer', 'fpo', 'field_assistant', 'bulk_buyer', 'logistics_provider')
    for index, role in enumerate(roles):
        response = client.post('/api/auth/register', json={
            'full_name': f'Test {role}',
            'email': f'{role}-{index}@test.com',
            'password': 'password123',
            'role': role,
        })
        assert response.status_code == 201
        assert response.get_json()['verification_required'] is True


def test_smtp_app_password_ignores_grouping_spaces(monkeypatch):
    captured = {}

    class FakeSMTP:
        def __init__(self, server, port, timeout):
            captured['connection'] = (server, port, timeout)

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def starttls(self):
            captured['tls'] = True

        def login(self, username, password):
            captured['login'] = (username, password)

        def send_message(self, message):
            captured['recipient'] = message['To']

    monkeypatch.setattr(mail.smtplib, 'SMTP', FakeSMTP)
    app = create_app()
    app.config.update(
        MAIL_USERNAME='sender@example.com',
        MAIL_PASSWORD='abcd efgh ijkl mnop',
        MAIL_DEFAULT_SENDER='sender@example.com',
    )

    with app.app_context():
        mail.send_otp_email('recipient@example.com', 'Subject', '123456', 'verification')

    assert captured['login'] == ('sender@example.com', 'abcdefghijklmnop')
    assert captured['recipient'] == 'recipient@example.com'


def test_forgot_password_creates_reset_request(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    sent = []
    monkeypatch.setattr('app.routes.auth.send_otp_email', lambda *args: sent.append(args))
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        db.session.add(User(
            full_name='Reset User',
            email='reset@test.com',
            password_hash=generate_password_hash('password123'),
            role='consumer',
        ))
        db.session.commit()

    response = client.post('/api/auth/forgot-password', json={'identifier': ' reset@test.com '})

    assert response.status_code == 200
    assert response.get_json()['success'] is True
    assert sent and sent[0][0] == 'reset@test.com'


def test_forgot_password_removes_token_when_email_fails(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    monkeypatch.setattr('app.routes.auth.send_otp_email', lambda *args: (_ for _ in ()).throw(RuntimeError('SMTP unavailable')))
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        db.session.add(User(
            full_name='Reset User',
            email='reset-failure@test.com',
            password_hash=generate_password_hash('password123'),
            role='consumer',
        ))
        db.session.commit()

    response = client.post('/api/auth/forgot-password', json={'identifier': 'reset-failure@test.com'})

    assert response.status_code == 503
    with app.app_context():
        assert User.query.filter_by(email='reset-failure@test.com').count() == 1
