from flask import Blueprint, jsonify, request

from .. import db
from ..models.order import Order
from ..models.review import Review
from ..utils.auth import jwt_required_roles

reviews_bp = Blueprint('reviews_bp', __name__)


@reviews_bp.get('/products/<int:product_id>')
def list_reviews(product_id):
    reviews = Review.query.filter_by(product_id=product_id).order_by(Review.id.desc()).all()
    return jsonify({'success': True, 'items': [review.to_dict() for review in reviews], 'count': len(reviews)})


@reviews_bp.post('/')
@jwt_required_roles('consumer', 'bulk_buyer')
def create_review(user):
    data = request.get_json(silent=True) or {}
    try:
        product_id = int(data['product_id'])
        order_id = int(data['order_id'])
        rating = int(data['rating'])
    except (KeyError, TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Product, order and rating are required'}), 400
    if rating < 1 or rating > 5:
        return jsonify({'success': False, 'message': 'Rating must be between 1 and 5'}), 400
    order = Order.query.filter_by(id=order_id, customer_id=user.id, status='COMPLETED').first()
    if order is None or not any(item.product_id == product_id for item in order.items):
        return jsonify({'success': False, 'message': 'Only completed purchases can be reviewed'}), 403
    if Review.query.filter_by(product_id=product_id, customer_id=user.id, order_id=order_id).first():
        return jsonify({'success': False, 'message': 'This purchase has already been reviewed'}), 409
    review = Review(product_id=product_id, customer_id=user.id, order_id=order_id, rating=rating, comment=(data.get('comment') or '').strip() or None)
    db.session.add(review)
    db.session.commit()
    return jsonify({'success': True, 'review': review.to_dict()}), 201
