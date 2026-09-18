from collections import defaultdict
import secrets

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from .. import db
from ..models.partners import BulkRequirement, FieldAssignment, FPOAggregation, FPOMembership
from ..models.order import Order, OrderItem
from ..models.logistics import Delivery
from ..models.product import Product
from ..models.user import User
from ..utils.auth import jwt_required_roles

partners_bp = Blueprint('partners_bp', __name__)


@partners_bp.get('/fpo/logistics')
@jwt_required_roles('fpo')
def fpo_logistics(user):
    member_ids = db.session.query(FPOMembership.farmer_id).filter_by(fpo_id=user.id, status='ACTIVE').subquery()
    deliveries = Delivery.query.join(Order, Delivery.order_id == Order.id).join(OrderItem, OrderItem.order_id == Order.id).join(Product, Product.id == OrderItem.product_id).filter(Product.farmer_id.in_(member_ids)).distinct().order_by(Delivery.id.desc()).all()
    return jsonify({'success': True, 'items': [delivery.to_dict() for delivery in deliveries]})


@partners_bp.get('/fpo/analytics')
@jwt_required_roles('fpo')
def fpo_analytics(user):
    member_ids = db.session.query(FPOMembership.farmer_id).filter_by(fpo_id=user.id, status='ACTIVE').subquery()
    products = Product.query.filter(Product.farmer_id.in_(member_ids), Product.is_active.is_(True)).all()
    product_ids = [product.id for product in products]
    orders = Order.query.join(OrderItem).filter(OrderItem.product_id.in_(product_ids)).distinct().all() if product_ids else []
    crop_sales = defaultdict(lambda: {'quantity': 0, 'sales': 0})
    for order in orders:
        if order.status in {'PENDING', 'CANCELLED'}:
            continue
        for item in order.items:
            if item.product_id in product_ids and item.product:
                crop_sales[item.product.crop]['quantity'] += item.quantity
                crop_sales[item.product.crop]['sales'] += item.quantity * item.unit_price
    return jsonify({'success': True, 'metrics': {
        'total_sales': round(sum(values['sales'] for values in crop_sales.values()), 2),
        'total_quantity': round(sum(values['quantity'] for values in crop_sales.values()), 2),
        'total_orders': len(orders),
        'active_farmers': FPOMembership.query.filter_by(fpo_id=user.id, status='ACTIVE').count(),
    }, 'by_crop': sorted(({'crop': crop, **values} for crop, values in crop_sales.items()), key=lambda item: item['sales'], reverse=True)})


@partners_bp.get('/fpo/overview')
@jwt_required_roles('fpo')
def fpo_overview(user):
    member_ids = db.session.query(FPOMembership.farmer_id).filter_by(fpo_id=user.id, status='ACTIVE').subquery()
    members = FPOMembership.query.filter_by(fpo_id=user.id, status='ACTIVE').all()
    farmer_names = {farmer.id: farmer.full_name for farmer in User.query.filter(User.id.in_([member.farmer_id for member in members])).all()}
    products = Product.query.filter(Product.farmer_id.in_(member_ids), Product.is_active.is_(True)).all()
    product_ids = [product.id for product in products]
    orders = []
    if product_ids:
        orders = Order.query.join(OrderItem).filter(OrderItem.product_id.in_(product_ids)).distinct().order_by(Order.created_at.desc()).all()

    monthly_sales = defaultdict(float)
    crop_summary = defaultdict(lambda: {'quantity': 0, 'sales': 0})
    for order in orders:
        if order.status in {'CANCELLED', 'PENDING'}:
            continue
        month = order.created_at.strftime('%b') if order.created_at else 'N/A'
        monthly_sales[month] += sum(item.quantity * item.unit_price for item in order.items if item.product_id in product_ids)
        for item in order.items:
            if item.product_id in product_ids:
                crop = item.product.crop if item.product else 'Other'
                crop_summary[crop]['quantity'] += item.quantity
                crop_summary[crop]['sales'] += item.quantity * item.unit_price

    recent_orders = []
    for order in orders[:5]:
        owned_items = [item for item in order.items if item.product_id in product_ids]
        recent_orders.append({
            'id': order.id,
            'status': order.status,
            'created_at': order.created_at.isoformat() if order.created_at else None,
            'quantity': round(sum(item.quantity for item in owned_items), 2),
            'amount': round(sum(item.quantity * item.unit_price for item in owned_items), 2),
            'crop': owned_items[0].product.crop if owned_items and owned_items[0].product else 'Order',
        })

    farmer_supply = []
    for member in members:
        farmer_products = [product for product in products if product.farmer_id == member.farmer_id]
        farmer_supply.append({
            'farmer_id': member.farmer_id,
            'name': farmer_names.get(member.farmer_id, f'Farmer #{member.farmer_id}'),
            'status': member.status,
            'products': len(farmer_products),
            'quantity': round(sum(product.quantity or 0 for product in farmer_products), 2),
            'crops': sorted({product.crop for product in farmer_products}),
            'location': farmer_products[0].location if farmer_products else 'Not set',
        })

    total_sales = sum(monthly_sales.values())
    pending_orders = sum(1 for order in orders if order.status == 'PENDING')
    return jsonify({
        'success': True,
        'metrics': {
            'farmers': len(members),
            'supply': round(sum(product.quantity or 0 for product in products), 2),
            'sales': round(total_sales, 2),
            'pending_orders': pending_orders,
        },
        'monthly_sales': dict(monthly_sales),
        'top_crops': sorted(({'crop': crop, **values} for crop, values in crop_summary.items()), key=lambda item: item['sales'], reverse=True)[:5],
        'recent_orders': recent_orders,
        'farmer_supply': farmer_supply,
        'marketplace': [product.to_dict() for product in products],
    })


@partners_bp.get('/fpo/members')
@jwt_required_roles('fpo')
def fpo_members(user):
    records = FPOMembership.query.filter_by(fpo_id=user.id).all()
    return jsonify({'success': True, 'items': [record.to_dict() for record in records]})


@partners_bp.patch('/fpo/inventory/<int:product_id>')
@jwt_required_roles('fpo')
def update_fpo_inventory(user, product_id):
    product = Product.query.join(FPOMembership, FPOMembership.farmer_id == Product.farmer_id).filter(
        Product.id == product_id, FPOMembership.fpo_id == user.id, FPOMembership.status == 'ACTIVE'
    ).first()
    if not product:
        return jsonify({'success': False, 'message': 'Inventory item not found in your FPO'}), 404
    data = request.get_json(silent=True) or {}
    try:
        quantity = float(data.get('quantity', product.quantity))
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Quantity must be a number'}), 400
    if quantity < 0:
        return jsonify({'success': False, 'message': 'Quantity cannot be negative'}), 400
    product.quantity = quantity
    db.session.commit()
    return jsonify({'success': True, 'product': product.to_dict()})


@partners_bp.post('/fpo/members')
@jwt_required_roles('fpo')
def add_fpo_member(user):
    farmer = db.session.get(User, (request.get_json(silent=True) or {}).get('farmer_id'))
    if not farmer or farmer.role != 'farmer':
        return jsonify({'success': False, 'message': 'Farmer not found'}), 404
    if FPOMembership.query.filter_by(fpo_id=user.id, farmer_id=farmer.id).first():
        return jsonify({'success': False, 'message': 'Farmer is already a member'}), 409
    membership = FPOMembership(fpo_id=user.id, farmer_id=farmer.id)
    db.session.add(membership)
    db.session.commit()
    return jsonify({'success': True, 'membership': membership.to_dict()}), 201


@partners_bp.get('/fpo/aggregations')
@jwt_required_roles('fpo')
def fpo_aggregations(user):
    records = FPOAggregation.query.filter_by(fpo_id=user.id).all()
    return jsonify({'success': True, 'items': [record.to_dict() for record in records]})


@partners_bp.post('/fpo/aggregations')
@jwt_required_roles('fpo')
def create_aggregation(user):
    data = request.get_json(silent=True) or {}
    try:
        quantity = float(data.get('quantity', 0))
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Quantity must be a number'}), 400
    crop = str(data.get('crop', '')).strip()
    if not crop or quantity <= 0:
        return jsonify({'success': False, 'message': 'Crop and positive quantity are required'}), 400
    aggregation = FPOAggregation(fpo_id=user.id, crop=crop, quantity=quantity)
    db.session.add(aggregation)
    db.session.commit()
    return jsonify({'success': True, 'aggregation': aggregation.to_dict()}), 201


@partners_bp.get('/field-assistant/farmers')
@jwt_required_roles('field_assistant')
def assigned_farmers(user):
    records = FieldAssignment.query.filter_by(assistant_id=user.id, status='ACTIVE').all()
    farmer_ids = [record.farmer_id for record in records]
    farmers = {farmer.id: farmer for farmer in User.query.filter(User.id.in_(farmer_ids), User.role == 'farmer').all()} if farmer_ids else {}
    return jsonify({'success': True, 'items': [{**record.to_dict(), 'farmer': farmers[record.farmer_id].to_dict() if record.farmer_id in farmers else None} for record in records]})


@partners_bp.post('/field-assistant/farmers')
@jwt_required_roles('field_assistant')
def assign_farmer(user):
    farmer_id = (request.get_json(silent=True) or {}).get('farmer_id')
    farmer = db.session.get(User, farmer_id)
    if not farmer or farmer.role != 'farmer':
        return jsonify({'success': False, 'message': 'Farmer not found'}), 404
    if FieldAssignment.query.filter_by(assistant_id=user.id, farmer_id=farmer.id).first():
        return jsonify({'success': False, 'message': 'Farmer is already assigned'}), 409
    assignment = FieldAssignment(assistant_id=user.id, farmer_id=farmer.id)
    db.session.add(assignment)
    db.session.commit()
    return jsonify({'success': True, 'assignment': assignment.to_dict()}), 201


@partners_bp.post('/field-assistant/register-farmer')
@jwt_required_roles('field_assistant')
def register_field_farmer(user):
    data = request.get_json(silent=True) or {}
    full_name = str(data.get('full_name') or '').strip()
    phone = str(data.get('phone') or '').strip()
    village = str(data.get('village') or '').strip()
    address = str(data.get('address') or '').strip()
    language = str(data.get('language') or '').strip()
    if not full_name or not phone or not village or not address or not language:
        return jsonify({'success': False, 'message': 'Name, mobile number, village, address and language are required'}), 400

    profile_data = {
        'village': village,
        'address': address,
        'language': language,
        'farm_size': str(data.get('farm_size') or '').strip(),
        'farm_type': str(data.get('farm_type') or '').strip(),
        'crops': str(data.get('crops') or '').strip(),
    }
    farmer = User(
        full_name=full_name,
        email=f'farmer.{secrets.token_hex(8)}@farmdirect.local',
        phone=phone,
        password_hash=generate_password_hash(secrets.token_urlsafe(24)),
        role='farmer',
        is_verified=True,
        profile_data=profile_data,
    )
    db.session.add(farmer)
    db.session.flush()
    assignment = FieldAssignment(assistant_id=user.id, farmer_id=farmer.id)
    db.session.add(assignment)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Farmer registered and added to your field team', 'farmer': farmer.to_dict(), 'assignment': assignment.to_dict()}), 201


@partners_bp.get('/field-assistant/produce')
@jwt_required_roles('field_assistant')
def field_assistant_produce(user):
    farmer_ids = db.session.query(FieldAssignment.farmer_id).filter_by(assistant_id=user.id, status='ACTIVE').subquery()
    products = Product.query.filter(Product.farmer_id.in_(farmer_ids)).order_by(Product.id.desc()).all()
    return jsonify({'success': True, 'items': [product.to_dict() for product in products]})


@partners_bp.post('/field-assistant/produce')
@jwt_required_roles('field_assistant')
def create_field_assistant_produce(user):
    data = request.get_json(silent=True) or {}
    try:
        farmer_id = int(data.get('farmer_id'))
        quantity = float(data.get('quantity', 0))
        price = float(data.get('price', 0))
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Farmer, quantity and price must be valid'}), 400
    farmer = User.query.join(FieldAssignment, FieldAssignment.farmer_id == User.id).filter(
        User.id == farmer_id, User.role == 'farmer', FieldAssignment.assistant_id == user.id, FieldAssignment.status == 'ACTIVE'
    ).first()
    if not farmer:
        return jsonify({'success': False, 'message': 'Select an active farmer assigned to you'}), 403
    name = str(data.get('name') or '').strip()
    crop = str(data.get('crop') or '').strip()
    location = str(data.get('location') or '').strip()
    if not name or not crop or not location or quantity <= 0 or price < 0:
        return jsonify({'success': False, 'message': 'Product name, variety, location, positive quantity and price are required'}), 400
    description = str(data.get('description') or '').strip()
    harvest_date = str(data.get('harvest_date') or '').strip()
    shelf_life = str(data.get('shelf_life') or '').strip()
    details = ' '.join(value for value in (description, f'Harvest: {harvest_date}' if harvest_date else '', f'Shelf life: {shelf_life}' if shelf_life else '') if value)
    product = Product(
        name=name,
        category=data.get('category', 'Produce'),
        crop=crop,
        description=details or None,
        quantity=quantity,
        unit=data.get('unit', 'kg'),
        price=price,
        quality=data.get('quality', 'Grade A'),
        location=location,
        farmer_id=farmer.id,
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Produce added for the selected farmer', 'product': product.to_dict()}), 201


@partners_bp.patch('/field-assistant/produce/<int:product_id>')
@jwt_required_roles('field_assistant')
def update_field_assistant_produce(user, product_id):
    farmer_ids = db.session.query(FieldAssignment.farmer_id).filter_by(assistant_id=user.id, status='ACTIVE').subquery()
    product = Product.query.filter(Product.id == product_id, Product.farmer_id.in_(farmer_ids)).first()
    if not product:
        return jsonify({'success': False, 'message': 'Produce not found for your assigned farmers'}), 404
    data = request.get_json(silent=True) or {}
    for field in ('quality', 'location', 'is_active'):
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
    return jsonify({'success': True, 'message': 'Inventory updated successfully', 'product': product.to_dict()})


@partners_bp.get('/field-assistant/sales')
@jwt_required_roles('field_assistant')
def field_assistant_sales(user):
    farmer_ids = db.session.query(FieldAssignment.farmer_id).filter_by(assistant_id=user.id, status='ACTIVE').subquery()
    orders = Order.query.join(OrderItem).join(Product).filter(Product.farmer_id.in_(farmer_ids)).distinct().order_by(Order.id.desc()).all()
    paid_statuses = {'PAID', 'CONFIRMED', 'LOGISTICS_REQUESTED', 'DELIVERED', 'COMPLETED'}
    paid_orders = [order for order in orders if order.status in paid_statuses]
    owned_lines = [item for order in orders for item in order.items if item.product and db.session.query(FieldAssignment).filter_by(assistant_id=user.id, farmer_id=item.product.farmer_id, status='ACTIVE').first()]
    revenue = sum(item.quantity * item.unit_price for item in owned_lines if item.order.status in paid_statuses)
    pending_amount = sum(sum(item.quantity * item.unit_price for item in order.items if item.product and item.product.farmer_id in {farmer_id for farmer_id in [assignment.farmer_id for assignment in FieldAssignment.query.filter_by(assistant_id=user.id, status='ACTIVE').all()]}) for order in orders if order.status in {'PENDING', 'PAID'})
    crop_totals = defaultdict(float)
    month_totals = defaultdict(float)
    for item in owned_lines:
        if item.order.status not in paid_statuses:
            continue
        amount = item.quantity * item.unit_price
        crop_totals[item.product.crop or item.product.name] += amount
        month_totals[item.order.created_at.strftime('%b') if item.order.created_at else 'Recent'] += amount
    return jsonify({'success': True, 'summary': {
        'revenue': round(revenue, 2),
        'paid_orders': len(paid_orders),
        'pending_amount': round(pending_amount, 2),
        'completed_revenue': round(max(revenue - pending_amount, 0), 2),
        'revenue_by_crop': [{'crop': crop, 'amount': round(amount, 2)} for crop, amount in crop_totals.items()],
        'monthly_revenue': [{'month': month, 'amount': round(amount, 2)} for month, amount in month_totals.items()],
        'history': [{'order_id': order.id, 'status': order.status, 'amount': round(sum(item.quantity * item.unit_price for item in order.items if item.product and item.product.farmer_id in {assignment.farmer_id for assignment in FieldAssignment.query.filter_by(assistant_id=user.id, status='ACTIVE').all()}), 2), 'created_at': order.created_at.isoformat() if order.created_at else None} for order in paid_orders[:8]],
    }})


@partners_bp.get('/bulk/requirements')
@jwt_required_roles('bulk_buyer')
def list_requirements(user):
    records = BulkRequirement.query.filter_by(buyer_id=user.id).order_by(BulkRequirement.id.desc()).all()
    return jsonify({'success': True, 'items': [record.to_dict() for record in records]})


@partners_bp.get('/fpo/bulk-buyers')
@jwt_required_roles('fpo')
def fpo_bulk_buyers(user):
    records = BulkRequirement.query.order_by(BulkRequirement.id.desc()).all()
    buyer_ids = {record.buyer_id for record in records}
    buyers = {buyer.id: buyer for buyer in User.query.filter(User.id.in_(buyer_ids)).all()} if buyer_ids else {}
    items = []
    for record in records:
        match = Product.query.filter(Product.crop.ilike(record.crop), Product.quantity >= record.quantity).order_by(Product.price.asc()).first()
        items.append({
            **record.to_dict(),
            'buyer_name': buyers.get(record.buyer_id).full_name if buyers.get(record.buyer_id) else f'Buyer #{record.buyer_id}',
            'estimated_value': round(record.quantity * match.price, 2) if match else None,
        })
    return jsonify({'success': True, 'items': items})


@partners_bp.patch('/fpo/bulk-buyers/<int:requirement_id>')
@jwt_required_roles('fpo')
def update_fpo_bulk_buyer(user, requirement_id):
    record = db.session.get(BulkRequirement, requirement_id)
    if not record:
        return jsonify({'success': False, 'message': 'Bulk request not found'}), 404
    status = str((request.get_json(silent=True) or {}).get('status', '')).upper()
    if status not in {'OPEN', 'ACCEPTED', 'COMPLETED', 'IN_TRANSIT', 'DELIVERED'}:
        return jsonify({'success': False, 'message': 'Invalid bulk request status'}), 400
    record.status = status
    db.session.commit()
    return jsonify({'success': True, 'item': record.to_dict()})


@partners_bp.post('/bulk/requirements')
@jwt_required_roles('bulk_buyer')
def create_requirement(user):
    data = request.get_json(silent=True) or {}
    try:
        quantity = float(data.get('quantity', 0))
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Quantity must be a number'}), 400
    crop = str(data.get('crop', '')).strip()
    location = str(data.get('location', '')).strip()
    if not crop or not location or quantity <= 0:
        return jsonify({'success': False, 'message': 'Crop, location and positive quantity are required'}), 400
    requirement = BulkRequirement(buyer_id=user.id, crop=crop, quantity=quantity, location=location)
    db.session.add(requirement)
    db.session.commit()
    return jsonify({'success': True, 'requirement': requirement.to_dict()}), 201


@partners_bp.delete('/bulk/requirements/<int:requirement_id>')
@jwt_required_roles('bulk_buyer')
def delete_requirement(user, requirement_id):
    requirement = BulkRequirement.query.filter_by(id=requirement_id, buyer_id=user.id).first()
    if not requirement:
        return jsonify({'success': False, 'message': 'Requirement not found'}), 404
    db.session.delete(requirement)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Requirement deleted'})


@partners_bp.get('/bulk/requirements/<int:requirement_id>/matches')
@jwt_required_roles('bulk_buyer')
def requirement_matches(user, requirement_id):
    requirement = BulkRequirement.query.filter_by(id=requirement_id, buyer_id=user.id).first()
    if not requirement:
        return jsonify({'success': False, 'message': 'Requirement not found'}), 404
    matches = Product.query.filter(Product.crop.ilike(requirement.crop), Product.quantity >= requirement.quantity).order_by(Product.price.asc()).all()
    return jsonify({'success': True, 'matches': [match.to_dict() for match in matches]})
