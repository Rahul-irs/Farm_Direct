from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required, verify_jwt_in_request

from ..models.user import User
from ..models.password_reset import PasswordResetToken
from ..models.email_verification import EmailVerificationToken
from .. import db
from ..utils.auth import jwt_required_roles
from ..services.mail import send_otp_email

auth_bp = Blueprint('auth_bp', __name__)


def _hash_reset_code(code):
    return hashlib.sha256(code.encode('utf-8')).hexdigest()


def _create_code():
    return f'{secrets.randbelow(1000000):06d}'


def _expires_at():
    return datetime.now(timezone.utc) + timedelta(minutes=10)


@auth_bp.post('/register')
def register():
    data = request.get_json(silent=True) or {}
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'consumer')

    if not full_name or not email or not password:
        return jsonify({'success': False, 'message': 'Full name, email and password are required'}), 400
    if role not in {'consumer', 'farmer', 'fpo', 'field_assistant', 'bulk_buyer', 'logistics_provider'}:
        return jsonify({'success': False, 'message': 'Invalid registration role'}), 400

    if User.query.filter_by(email=email.lower()).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409

    user = User(
        full_name=full_name,
        email=email.lower(),
        phone=data.get('phone'),
        password_hash=generate_password_hash(password),
        role=role,
        is_verified=False,
    )
    db.session.add(user)
    db.session.commit()

    code = _create_code()
    verification_token = EmailVerificationToken(user_id=user.id, token_hash=_hash_reset_code(code), expires_at=_expires_at())
    db.session.add(verification_token)
    db.session.commit()
    try:
        send_otp_email(user.email, 'Verify your FarmDirect AI account', code, 'email verification')
    except Exception:
        db.session.delete(verification_token)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': False, 'message': 'Unable to send verification email'}), 503

    return jsonify({
        'success': True,
        'message': 'Registration successful. Check your email for the verification code.',
        'verification_required': True,
        'email': user.email,
    }), 201


@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    if not user.is_verified:
        return jsonify({'success': False, 'message': 'Verify your email before signing in', 'verification_required': True}), 403

    access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': user.to_dict(),
        'token': access_token,
        'refresh_token': refresh_token,
    })


@auth_bp.post('/verify-email')
def verify_email():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()
    user = User.query.filter_by(email=email).first()
    token = EmailVerificationToken.query.filter_by(user_id=user.id if user else 0, token_hash=_hash_reset_code(code), used_at=None).order_by(EmailVerificationToken.id.desc()).first()
    if not token or token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return jsonify({'success': False, 'message': 'Invalid or expired verification code'}), 400
    user.is_verified = True
    token.used_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Email verified successfully'})


@auth_bp.post('/resend-verification')
def resend_verification():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    user = User.query.filter_by(email=email).first()
    if user and not user.is_verified:
        code = _create_code()
        db.session.add(EmailVerificationToken(user_id=user.id, token_hash=_hash_reset_code(code), expires_at=_expires_at()))
        db.session.commit()
        send_otp_email(user.email, 'Your FarmDirect AI verification code', code, 'email verification')
    return jsonify({'success': True, 'message': 'If the account needs verification, a new code has been sent.'})

@auth_bp.post('/refresh')
@jwt_required(refresh=True)
def refresh_access_token():
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None or not user.is_active:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
    return jsonify({'success': True, 'token': token})


@auth_bp.get('/me')
def me():
    verify_jwt_in_request(optional=True)
    identity = get_jwt_identity()
    if identity is None:
        return jsonify({'success': True, 'message': 'Auth available'})

    user = db.session.get(User, int(identity))
    if user is None:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    return jsonify({'success': True, 'user': user.to_dict()})


@auth_bp.patch('/me')
@jwt_required_roles()
def update_me(user):
    data = request.get_json(silent=True) or {}
    full_name = (data.get('full_name') or '').strip()
    if not full_name:
        return jsonify({'success': False, 'message': 'Full name is required'}), 400
    user.full_name = full_name
    if 'phone' in data:
        user.phone = (data.get('phone') or '').strip() or None
    db.session.commit()
    return jsonify({'success': True, 'user': user.to_dict()})


@auth_bp.post('/change-password')
@jwt_required_roles()
def change_password(user):
    data = request.get_json(silent=True) or {}
    current_password = data.get('current_password') or ''
    new_password = data.get('new_password') or ''
    if not check_password_hash(user.password_hash, current_password):
        return jsonify({'success': False, 'message': 'Current password is incorrect'}), 400
    if len(new_password) < 8:
        return jsonify({'success': False, 'message': 'New password must be at least 8 characters'}), 400
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Password changed successfully'})


@auth_bp.post('/forgot-password')
def forgot_password():
    data = request.get_json(silent=True) or {}
    identifier = (data.get('identifier') or '').strip().lower()
    user = User.query.filter((User.email == identifier) | (User.phone == identifier)).first()
    if user:
        code = _create_code()
        token = PasswordResetToken(user_id=user.id, token_hash=_hash_reset_code(code), expires_at=_expires_at())
        db.session.add(token)
        db.session.commit()
        try:
            send_otp_email(user.email, 'FarmDirect AI password reset code', code, 'password reset')
        except Exception:
            db.session.delete(token)
            db.session.commit()
            return jsonify({'success': False, 'message': 'Unable to send reset code'}), 503
    return jsonify({'success': True, 'message': 'If an account matches, a reset code has been sent.'})


@auth_bp.post('/verify-reset-code')
def verify_reset_code():
    data = request.get_json(silent=True) or {}
    identifier = (data.get('identifier') or '').strip().lower()
    code = (data.get('code') or '').strip()
    user = User.query.filter((User.email == identifier) | (User.phone == identifier)).first()
    token = PasswordResetToken.query.filter_by(user_id=user.id if user else 0, token_hash=_hash_reset_code(code), used_at=None).order_by(PasswordResetToken.id.desc()).first()
    if not token or token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return jsonify({'success': False, 'message': 'Invalid or expired reset code'}), 400
    return jsonify({'success': True, 'message': 'Code verified'})


@auth_bp.post('/reset-password')
def reset_password():
    data = request.get_json(silent=True) or {}
    identifier = (data.get('identifier') or '').strip().lower()
    code = (data.get('code') or '').strip()
    password = data.get('password') or ''
    user = User.query.filter((User.email == identifier) | (User.phone == identifier)).first()
    token = PasswordResetToken.query.filter_by(user_id=user.id if user else 0, token_hash=_hash_reset_code(code), used_at=None).order_by(PasswordResetToken.id.desc()).first()
    if not token or token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return jsonify({'success': False, 'message': 'Invalid or expired reset code'}), 400
    if len(password) < 8:
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters'}), 400
    user.password_hash = generate_password_hash(password)
    token.used_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Password reset successfully'})
