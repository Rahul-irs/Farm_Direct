from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from .. import db
from ..models.user import User


def current_user():
    identity = get_jwt_identity()
    return db.session.get(User, int(identity)) if identity else None


def jwt_required_roles(*roles):
    def decorator(handler):
        @wraps(handler)
        def wrapped(*args, **kwargs):
            verify_jwt_in_request()
            user = current_user()
            if user is None or not user.is_active:
                return jsonify({'success': False, 'message': 'Authentication required'}), 401
            if roles and user.role not in roles:
                return jsonify({'success': False, 'message': 'You do not have permission for this action'}), 403
            return handler(user, *args, **kwargs)
        return wrapped
    return decorator