from flask import Blueprint, jsonify, request

from .. import db
from ..models.cart import Cart, CartItem
from ..models.order import Order, OrderItem
from ..models.product import Product
from ..models.notification import Notification
from ..models.logistics import Delivery, TrackingEvent
from ..models.payment import Payment
from ..utils.auth import jwt_required_roles

orders_bp = Blueprint('orders_bp', __name__)


@orders_bp.get('/cart')
@jwt_required_roles('consumer', 'bulk_buyer')
def get_cart(user):
    cart = Cart.query.filter_by(customer_id=user.id).first()
    return jsonify({'success': True, 'cart': cart.to_dict() if cart else {'id': None, 'customer_id': user.id, 'items': []}})


@orders_bp.post('/cart/items')
@jwt_required_roles('consumer', 'bulk_buyer')
def add_to_cart(user):
    data = request.get_json(silent=True) or {}
    try:
        product_id = int(data['product_id'])
        quantity = float(data['quantity'])
    except (KeyError, TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Product and quantity are required'}), 400
    if quantity <= 0:
        return jsonify({'success': False, 'message': 'Quantity must be positive'}), 400
    product = db.session.get(Product, product_id)
    if product is None:
        return jsonify({'success': False, 'message': 'Product not found'}), 404
    cart = Cart.query.filter_by(customer_id=user.id).first() or Cart(customer_id=user.id)
    if cart.id is None:
        db.session.add(cart)
        db.session.flush()
    item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()
    next_quantity = quantity + (item.quantity if item else 0)
    if next_quantity > product.quantity:
        return jsonify({'success': False, 'message': 'Requested quantity exceeds available inventory'}), 409
    if item:
        item.quantity = next_quantity
    else:
        db.session.add(CartItem(cart_id=cart.id, product_id=product.id, quantity=quantity))
    db.session.commit()
    return jsonify({'success': True, 'cart': cart.to_dict()}), 201


@orders_bp.delete('/cart/items/<int:item_id>')
@jwt_required_roles('consumer', 'bulk_buyer')
def remove_from_cart(user, item_id):
    item = CartItem.query.join(Cart).filter(Cart.customer_id == user.id, CartItem.id == item_id).first()
    if item is None:
        return jsonify({'success': False, 'message': 'Cart item not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Item removed'})


@orders_bp.get('/')
@jwt_required_roles('consumer', 'bulk_buyer', 'farmer', 'fpo', 'field_assistant', 'admin')
def list_orders(user):
    if user.role == 'admin':
        query = Order.query
    elif user.role == 'farmer':
        query = Order.query.join(OrderItem).join(Product).filter(Product.farmer_id == user.id).distinct()
    else:
        query = Order.query.filter_by(customer_id=user.id)
    orders = query.order_by(Order.id.desc()).all()
    return jsonify({'success': True, 'items': [o.to_dict() for o in orders], 'count': len(orders)})


@orders_bp.post('/')
@jwt_required_roles('consumer', 'bulk_buyer')
def create_order(user):
    cart = Cart.query.filter_by(customer_id=user.id).first()
    if not cart or not cart.items:
        return jsonify({'success': False, 'message': 'Your cart is empty'}), 400
    for item in cart.items:
        if item.quantity > item.product.quantity:
            return jsonify({'success': False, 'message': f'Not enough inventory for {item.product.name}'}), 409
    total = sum(item.quantity * item.product.price for item in cart.items)
    order = Order(customer_id=user.id, total_amount=round(total, 2), status='PENDING')
    db.session.add(order)
    db.session.flush()
    for item in cart.items:
        item.product.quantity -= item.quantity
        db.session.add(OrderItem(order_id=order.id, product_id=item.product_id, quantity=item.quantity, unit_price=item.product.price))
        db.session.add(Notification(user_id=item.product.farmer_id, title='New order received', message=f'Order #{order.id} includes {item.quantity:g} {item.product.unit} of {item.product.name}.'))
    db.session.add(Notification(user_id=user.id, title='Order placed', message=f'Order #{order.id} was placed successfully.'))
    CartItem.query.filter_by(cart_id=cart.id).delete()
    db.session.commit()
    return jsonify({'success': True, 'message': 'Order created', 'order': order.to_dict()}), 201


@orders_bp.patch('/<int:order_id>/status')
@jwt_required_roles('farmer', 'admin')
def update_order_status(user, order_id):
    order = db.get_or_404(Order, order_id)
    if user.role == 'farmer' and not any(item.product.farmer_id == user.id for item in order.items):
        return jsonify({'success': False, 'message': 'You do not manage this order'}), 403
    next_status = (request.get_json(silent=True) or {}).get('status')
    allowed = {'PENDING': {'CONFIRMED', 'CANCELLED'}, 'PAID': {'CONFIRMED', 'CANCELLED'}, 'CONFIRMED': {'LOGISTICS_REQUESTED', 'CANCELLED'}, 'LOGISTICS_REQUESTED': {'COMPLETED'}}
    if next_status not in allowed.get(order.status, set()):
        return jsonify({'success': False, 'message': f'Invalid transition from {order.status} to {next_status}'}), 400
    order.status = next_status
    if next_status == 'LOGISTICS_REQUESTED' and not Delivery.query.filter_by(order_id=order.id).first():
        pickup = order.items[0].product.location if order.items else 'Farm pickup'
        delivery = Delivery(order_id=order.id, pickup_location=pickup, destination='Customer delivery address')
        db.session.add(delivery)
        db.session.flush()
        db.session.add(TrackingEvent(delivery_id=delivery.id, status='AVAILABLE', note='Delivery request created'))
    db.session.commit()
    return jsonify({'success': True, 'order': order.to_dict()})


@orders_bp.delete('/<int:order_id>')
@jwt_required_roles('farmer', 'admin')
def delete_order(user, order_id):
    order = db.get_or_404(Order, order_id)
    if user.role == 'farmer' and not any(item.product.farmer_id == user.id for item in order.items):
        return jsonify({'success': False, 'message': 'You do not manage this order'}), 403
    delivery = Delivery.query.filter_by(order_id=order.id).first()
    if delivery:
        db.session.delete(delivery)
    payment = Payment.query.filter_by(order_id=order.id).first()
    if payment:
        db.session.delete(payment)
    db.session.delete(order)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Order deleted'})
