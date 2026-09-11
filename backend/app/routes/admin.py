from flask import Blueprint, jsonify, request
from sqlalchemy import func

from .. import db
from ..models.order import Order
from ..models.user import User
from ..models.product import Product
from ..models.order import Order, OrderItem
from ..models.audit import AuditLog
from ..utils.auth import jwt_required_roles

admin_bp = Blueprint('admin_bp', __name__)


@admin_bp.get('/overview')
@jwt_required_roles('admin')
def overview(user):
    users = User.query.count()
    farmers = User.query.filter_by(role='farmer').count()
    orders = Order.query.count()
    revenue = db.session.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar()
    return jsonify({
        'success': True,
        'data': {
            'users': users,
            'farmers': farmers,
            'orders': orders,
            'revenue': float(revenue),
        }
    })


@admin_bp.get('/users')
@jwt_required_roles('admin')
def users(user):
    records = User.query.order_by(User.id.desc()).all()
    return jsonify({'success': True, 'items': [record.to_dict() for record in records], 'count': len(records)})


@admin_bp.get('/products')
@jwt_required_roles('admin')
def products(user):
    records = Product.query.order_by(Product.id.desc()).all()
    return jsonify({'success': True, 'items': [record.to_dict() for record in records], 'count': len(records)})


@admin_bp.get('/orders')
@jwt_required_roles('admin')
def orders(user):
    records = Order.query.order_by(Order.id.desc()).all()
    return jsonify({'success': True, 'items': [record.to_dict() for record in records], 'count': len(records)})


@admin_bp.get('/analytics')
@jwt_required_roles('admin')
def analytics(user):
    status_rows = db.session.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    role_rows = db.session.query(User.role, func.count(User.id)).group_by(User.role).all()
    return jsonify({'success': True, 'data': {'orders_by_status': {status: count for status, count in status_rows}, 'users_by_role': {role: count for role, count in role_rows}}})


@admin_bp.patch('/users/<int:user_id>/status')
@jwt_required_roles('admin')
def update_user_status(user, user_id):
    record = db.session.get(User, user_id)
    if record is None:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    if record.id == user.id:
        return jsonify({'success': False, 'message': 'You cannot deactivate your own account'}), 400
    record.is_active = bool((request.get_json(silent=True) or {}).get('is_active'))
    db.session.add(AuditLog(actor_id=user.id, action='user_status_changed', target_type='user', target_id=record.id, details=f'is_active={record.is_active}'))
    db.session.commit()
    return jsonify({'success': True, 'user': record.to_dict()})


@admin_bp.get('/audit-logs')
@jwt_required_roles('admin')
def audit_logs(user):
    records = AuditLog.query.order_by(AuditLog.id.desc()).limit(100).all()
    return jsonify({'success': True, 'items': [record.to_dict() for record in records], 'count': len(records)})
