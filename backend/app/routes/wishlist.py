from flask import Blueprint, jsonify

from .. import db
from ..models.product import Product
from ..models.wishlist import WishlistItem
from ..utils.auth import jwt_required_roles

wishlist_bp = Blueprint('wishlist_bp', __name__)


@wishlist_bp.get('/')
@jwt_required_roles('consumer', 'bulk_buyer')
def list_wishlist(user):
    items = WishlistItem.query.filter_by(user_id=user.id).order_by(WishlistItem.id.desc()).all()
    return jsonify({'success': True, 'items': [item.to_dict() for item in items], 'count': len(items)})


@wishlist_bp.post('/<int:product_id>')
@jwt_required_roles('consumer', 'bulk_buyer')
def add_wishlist(user, product_id):
    product = Product.query.filter_by(id=product_id, is_active=True).first()
    if product is None:
        return jsonify({'success': False, 'message': 'Product not found'}), 404
    item = WishlistItem.query.filter_by(user_id=user.id, product_id=product.id).first()
    if item is None:
        item = WishlistItem(user_id=user.id, product_id=product.id)
        db.session.add(item)
        db.session.commit()
    return jsonify({'success': True, 'item': item.to_dict()})


@wishlist_bp.delete('/<int:product_id>')
@jwt_required_roles('consumer', 'bulk_buyer')
def remove_wishlist(user, product_id):
    item = WishlistItem.query.filter_by(user_id=user.id, product_id=product_id).first()
    if item is None:
        return jsonify({'success': False, 'message': 'Wishlist item not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Product removed from wishlist'})
