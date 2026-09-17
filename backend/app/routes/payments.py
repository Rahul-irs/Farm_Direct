import secrets
from collections import defaultdict

from flask import Blueprint, jsonify
from sqlalchemy import func

from .. import db
from ..models.order import Order
from ..models.order import OrderItem
from ..models.payment import Payment
from ..models.product import Product
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
    order.status = 'PAID'
    db.session.add(payment)
    db.session.commit()
    return jsonify({'success': True, 'payment': payment.to_dict(), 'order': order.to_dict()}), 201


@payments_bp.get('/')
@jwt_required_roles('consumer', 'bulk_buyer', 'admin')
def list_payments(user):
    query = Payment.query if user.role == 'admin' else Payment.query.filter_by(customer_id=user.id)
    payments = query.order_by(Payment.id.desc()).all()
    return jsonify({'success': True, 'items': [payment.to_dict() for payment in payments], 'count': len(payments)})


@payments_bp.get('/farmer/summary')
@jwt_required_roles('farmer')
def farmer_payment_summary(user):
    paid_orders = Order.query.join(OrderItem).join(Product).filter(Product.farmer_id == user.id, Order.status.in_(['PAID', 'CONFIRMED', 'LOGISTICS_REQUESTED', 'DELIVERED', 'COMPLETED'])).distinct().all()
    lines = [item for order in paid_orders for item in order.items if item.product.farmer_id == user.id]
    revenue = sum(item.quantity * item.unit_price for item in lines)
    sold_quantity = sum(item.quantity for item in lines)
    all_orders = Order.query.join(OrderItem).join(Product).filter(Product.farmer_id == user.id).distinct().all()
    pending_amount = sum(order.total_amount for order in all_orders if order.status in {'PENDING', 'PAID'})
    revenue_by_crop = defaultdict(float)
    monthly_revenue = defaultdict(float)
    for order in paid_orders:
        for item in order.items:
            if item.product.farmer_id != user.id:
                continue
            amount = item.quantity * item.unit_price
            revenue_by_crop[item.product.crop or item.product.name] += amount
            month = order.created_at.strftime('%b') if order.created_at else 'Recent'
            monthly_revenue[month] += amount
    return jsonify({'success': True, 'summary': {
        'revenue': round(revenue, 2),
        'sold_quantity': round(sold_quantity, 2),
        'paid_orders': len(paid_orders),
        'pending_amount': round(pending_amount, 2),
        'completed_revenue': round(revenue - pending_amount if revenue > pending_amount else revenue, 2),
        'revenue_by_crop': [{'crop': crop, 'amount': round(amount, 2)} for crop, amount in revenue_by_crop.items()],
        'monthly_revenue': [{'month': month, 'amount': round(amount, 2)} for month, amount in monthly_revenue.items()],
        'history': [
            {'order_id': order.id, 'status': order.status, 'amount': round(sum(item.quantity * item.unit_price for item in order.items if item.product.farmer_id == user.id), 2), 'created_at': order.created_at.isoformat() if order.created_at else None}
            for order in paid_orders
        ],
    }})