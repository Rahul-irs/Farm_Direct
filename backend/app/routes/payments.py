import secrets

from flask import Blueprint, jsonify

from .. import db
from ..models.order import Order
from ..models.payment import Payment
from ..utils.auth import jwt_required_roles

payments_bp = Blueprint('payments_bp', __name__)


@payments_bp.post('/orders/<int:order_id>/pay')
@jwt_required_roles('consumer', 'bulk_buyer')
def pay_for_order(user, order_id):
    order = Order.query.filter_by(id=order_id, customer_id=user.id).first()
    if order is None:
        return jsonify({'success': False, 'message': 'Order not found'}), 404
    if Payment.query.filter_by(order_id=order.id).first():
        return jsonify({'success': False, 'message': 'Order has already been paid'}), 409
    payment = Payment(order_id=order.id, customer_id=user.id, amount=order.total_amount, transaction_reference=f'DEV-{secrets.token_hex(8)}')
    order.status = 'COMPLETED'
    db.session.add(payment)
    db.session.commit()
    return jsonify({'success': True, 'payment': payment.to_dict(), 'order': order.to_dict()}), 201


@payments_bp.get('/')
@jwt_required_roles('consumer', 'bulk_buyer', 'admin')
def list_payments(user):
    query = Payment.query if user.role == 'admin' else Payment.query.filter_by(customer_id=user.id)
    payments = query.order_by(Payment.id.desc()).all()
    return jsonify({'success': True, 'items': [payment.to_dict() for payment in payments], 'count': len(payments)})