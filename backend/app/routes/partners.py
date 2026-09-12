from flask import Blueprint, jsonify, request

from .. import db
from ..models.partners import BulkRequirement, FieldAssignment, FPOAggregation, FPOMembership
from ..models.product import Product
from ..models.user import User
from ..utils.auth import jwt_required_roles

partners_bp = Blueprint('partners_bp', __name__)


@partners_bp.get('/fpo/members')
@jwt_required_roles('fpo')
def fpo_members(user):
    records = FPOMembership.query.filter_by(fpo_id=user.id).all()
    return jsonify({'success': True, 'items': [record.to_dict() for record in records]})


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
    return jsonify({'success': True, 'items': [record.to_dict() for record in records]})


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


@partners_bp.get('/bulk/requirements')
@jwt_required_roles('bulk_buyer')
def list_requirements(user):
    records = BulkRequirement.query.filter_by(buyer_id=user.id).order_by(BulkRequirement.id.desc()).all()
    return jsonify({'success': True, 'items': [record.to_dict() for record in records]})


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
