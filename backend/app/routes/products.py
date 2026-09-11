import os
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import or_
from werkzeug.utils import secure_filename

from .. import db
from ..models.product import Product
from ..utils.auth import jwt_required_roles

products_bp = Blueprint('products_bp', __name__)
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}


@products_bp.get('/')
def list_products():
    query = Product.query
    search = (request.args.get('search') or '').strip()
    if search:
        pattern = f'%{search}%'
        query = query.filter(or_(Product.name.ilike(pattern), Product.crop.ilike(pattern), Product.location.ilike(pattern)))
    products = query.order_by(Product.id.desc()).all()
    return jsonify({
        'success': True,
        'items': [p.to_dict() for p in products],
        'count': len(products),
    })


@products_bp.post('/')
@jwt_required_roles('farmer', 'admin')
def create_product(user):
    data = request.get_json(silent=True) or {}
    try:
        quantity = float(data.get('quantity', 0))
        price = float(data.get('price', 0))
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Quantity and price must be numbers'}), 400
    if not data.get('name') or quantity <= 0 or price < 0 or not data.get('location'):
        return jsonify({'success': False, 'message': 'Name, positive quantity, price and location are required'}), 400
    product = Product(
        name=data.get('name'),
        category=data.get('category', 'Produce'),
        crop=data.get('crop', 'Others'),
        description=data.get('description'),
        quantity=quantity,
        unit=data.get('unit', 'kg'),
        price=price,
        quality=data.get('quality', 'Grade A'),
        location=data.get('location', 'Unknown'),
        farmer_id=user.id if user.role == 'farmer' else int(data.get('farmer_id', user.id)),
        image_url=data.get('image_url'),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Product created', 'product': product.to_dict()}), 201


@products_bp.patch('/<int:product_id>')
@jwt_required_roles('farmer', 'admin')
def update_product(user, product_id):
    product = Product.query.get_or_404(product_id)
    if user.role != 'admin' and product.farmer_id != user.id:
        return jsonify({'success': False, 'message': 'You do not own this product'}), 403
    data = request.get_json(silent=True) or {}
    for field in ('name', 'category', 'crop', 'description', 'unit', 'quality', 'location', 'image_url'):
        if field in data:
            setattr(product, field, data[field])
    for field in ('quantity', 'price'):
        if field in data:
            try:
                value = float(data[field])
            except (TypeError, ValueError):
                return jsonify({'success': False, 'message': f'{field} must be a number'}), 400
            if value < 0 or (field == 'quantity' and value == 0):
                return jsonify({'success': False, 'message': f'{field} must be valid'}), 400
            setattr(product, field, value)
    db.session.commit()
    return jsonify({'success': True, 'product': product.to_dict()})


@products_bp.delete('/<int:product_id>')
@jwt_required_roles('farmer', 'admin')
def delete_product(user, product_id):
    product = Product.query.get_or_404(product_id)
    if user.role != 'admin' and product.farmer_id != user.id:
        return jsonify({'success': False, 'message': 'You do not own this product'}), 403
    db.session.delete(product)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Product deleted'})


@products_bp.post('/<int:product_id>/image')
@jwt_required_roles('farmer', 'admin')
def upload_product_image(user, product_id):
    product = Product.query.get_or_404(product_id)
    if user.role != 'admin' and product.farmer_id != user.id:
        return jsonify({'success': False, 'message': 'You do not own this product'}), 403
    image = request.files.get('image')
    if image is None or not image.filename:
        return jsonify({'success': False, 'message': 'Image file is required'}), 400
    extension = image.filename.rsplit('.', 1)[-1].lower() if '.' in image.filename else ''
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        return jsonify({'success': False, 'message': 'Only JPG, PNG and WEBP images are supported'}), 400
    filename = f'{uuid4().hex}.{extension}'
    image.save(os.path.join(current_app.config['UPLOAD_FOLDER'], secure_filename(filename)))
    product.image_url = f'/uploads/{filename}'
    db.session.commit()
    return jsonify({'success': True, 'product': product.to_dict()})
