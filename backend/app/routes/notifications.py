from flask import Blueprint, jsonify

from .. import db
from ..models.notification import Notification
from ..utils.auth import jwt_required_roles

notifications_bp = Blueprint('notifications_bp', __name__)


@notifications_bp.get('/')
@jwt_required_roles()
def list_notifications(user):
    notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.id.desc()).all()
    return jsonify({'success': True, 'items': [notification.to_dict() for notification in notifications], 'unread': sum(not notification.is_read for notification in notifications)})


@notifications_bp.post('/<int:notification_id>/read')
@jwt_required_roles()
def mark_read(user, notification_id):
    notification = Notification.query.filter_by(id=notification_id, user_id=user.id).first()
    if notification is None:
        return jsonify({'success': False, 'message': 'Notification not found'}), 404
    notification.is_read = True
    db.session.commit()
    return jsonify({'success': True, 'notification': notification.to_dict()})