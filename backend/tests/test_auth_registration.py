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


def test_registration_verification_and_login_normalize_email(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    sent_codes = []
    monkeypatch.setattr('app.routes.auth.send_otp_email', lambda *args: sent_codes.append(args[2]))
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()

    registration = client.post('/api/auth/register', json={
        'full_name': 'Normalized User',
        'email': '  Verify@Example.com  ',
        'password': 'password123',
        'role': 'consumer',
    })
    assert registration.status_code == 201
    assert registration.get_json()['email'] == 'verify@example.com'

    verification = client.post('/api/auth/verify-email', json={
        'email': ' VERIFY@example.com ',
        'code': sent_codes[0],
    })
    assert verification.status_code == 200

    login = client.post('/api/auth/login', json={
        'email': ' Verify@Example.com ',
        'password': 'password123',
    })
    assert login.status_code == 200
    login_payload = login.get_json()
    token = login_payload['token']
    assert client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'}).status_code == 200

    refreshed = client.post('/api/auth/refresh', headers={'Authorization': f"Bearer {login_payload['refresh_token']}"})
    assert refreshed.status_code == 200
    refreshed_token = refreshed.get_json()['token']
    logout = client.post('/api/auth/logout', headers={'Authorization': f'Bearer {refreshed_token}'})
    assert logout.status_code == 200


def test_login_rejects_inactive_account(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        db.session.add(User(
            full_name='Inactive User',
            email='inactive@test.com',
            password_hash=generate_password_hash('password123'),
            role='consumer',
            is_verified=True,
            is_active=False,
        ))
        db.session.commit()

    response = client.post('/api/auth/login', json={
        'email': 'inactive@test.com',
        'password': 'password123',
    })

    assert response.status_code == 403
    assert response.get_json()['success'] is False


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


def test_password_reset_and_change_password_journey(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    sent_codes = []
    monkeypatch.setattr('app.routes.auth.send_otp_email', lambda *args: sent_codes.append(args[2]))
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        db.session.add(User(
            full_name='Password User',
            email='password-user@test.com',
            password_hash=generate_password_hash('oldpassword'),
            role='consumer',
            is_verified=True,
        ))
        db.session.commit()

    identifier = 'password-user@test.com'
    assert client.post('/api/auth/forgot-password', json={'identifier': identifier}).status_code == 200
    code = sent_codes[-1]
    assert client.post('/api/auth/verify-reset-code', json={'identifier': identifier, 'code': code}).status_code == 200
    assert client.post('/api/auth/reset-password', json={
        'identifier': identifier,
        'code': code,
        'password': 'resetpassword',
    }).status_code == 200
    assert client.post('/api/auth/login', json={'email': identifier, 'password': 'oldpassword'}).status_code == 401

    login = client.post('/api/auth/login', json={'email': identifier, 'password': 'resetpassword'})
    assert login.status_code == 200
    headers = {'Authorization': f"Bearer {login.get_json()['token']}"}
    changed = client.post('/api/auth/change-password', json={
        'current_password': 'resetpassword',
        'new_password': 'changedpassword',
    }, headers=headers)
    assert changed.status_code == 200
    assert client.post('/api/auth/login', json={'email': identifier, 'password': 'changedpassword'}).status_code == 200
