from flask import Blueprint, jsonify, request

from .. import db
from ..models.logistics import Delivery, Driver, TrackingEvent, Vehicle
from ..models.notification import Notification
from ..models.order import Order
from ..utils.auth import jwt_required_roles

logistics_bp = Blueprint('logistics_bp', __name__)


@logistics_bp.get('/vehicles')
@jwt_required_roles('logistics_provider', 'admin')
def list_vehicles(user):
    query = Vehicle.query if user.role == 'admin' else Vehicle.query.filter_by(provider_id=user.id)
    vehicles = query.order_by(Vehicle.id.desc()).all()
    return jsonify({'success': True, 'items': [vehicle.to_dict() for vehicle in vehicles]})


@logistics_bp.post('/vehicles')
@jwt_required_roles('logistics_provider')
def create_vehicle(user):
    data = request.get_json(silent=True) or {}
    try:
        capacity = float(data.get('capacity_kg', 0))
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Capacity must be a number'}), 400
    if not data.get('registration_number') or not data.get('vehicle_type') or capacity <= 0:
        return jsonify({'success': False, 'message': 'Registration, type and positive capacity are required'}), 400
    if Vehicle.query.filter_by(registration_number=data['registration_number'].strip()).first():
        return jsonify({'success': False, 'message': 'Vehicle registration already exists'}), 409
    vehicle = Vehicle(provider_id=user.id, registration_number=data['registration_number'].strip(), vehicle_type=data['vehicle_type'].strip(), capacity_kg=capacity)
    db.session.add(vehicle)
    db.session.commit()
    return jsonify({'success': True, 'vehicle': vehicle.to_dict()}), 201


@logistics_bp.patch('/vehicles/<int:vehicle_id>')
@jwt_required_roles('logistics_provider')
def update_vehicle(user, vehicle_id):
    vehicle = Vehicle.query.filter_by(id=vehicle_id, provider_id=user.id).first()
    if vehicle is None:
        return jsonify({'success': False, 'message': 'Vehicle not found'}), 404
    data = request.get_json(silent=True) or {}
    if 'vehicle_type' in data:
        vehicle.vehicle_type = str(data['vehicle_type']).strip()
    if 'capacity_kg' in data:
        try:
            capacity = float(data['capacity_kg'])
        except (TypeError, ValueError):
            return jsonify({'success': False, 'message': 'Capacity must be a number'}), 400
        if capacity <= 0:
            return jsonify({'success': False, 'message': 'Capacity must be positive'}), 400
        vehicle.capacity_kg = capacity
    db.session.commit()
    return jsonify({'success': True, 'vehicle': vehicle.to_dict()})


@logistics_bp.delete('/vehicles/<int:vehicle_id>')
@jwt_required_roles('logistics_provider')
def delete_vehicle(user, vehicle_id):
    vehicle = Vehicle.query.filter_by(id=vehicle_id, provider_id=user.id).first()
    if vehicle is None:
        return jsonify({'success': False, 'message': 'Vehicle not found'}), 404
    if not vehicle.is_available:
        return jsonify({'success': False, 'message': 'Assigned vehicles cannot be removed'}), 409
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Vehicle removed'})


@logistics_bp.get('/drivers')
@jwt_required_roles('logistics_provider', 'admin')
def list_drivers(user):
    query = Driver.query if user.role == 'admin' else Driver.query.filter_by(provider_id=user.id)
    drivers = query.order_by(Driver.id.desc()).all()
    return jsonify({'success': True, 'items': [driver.to_dict() for driver in drivers]})


@logistics_bp.post('/drivers')
@jwt_required_roles('logistics_provider')
def create_driver(user):
    data = request.get_json(silent=True) or {}
    fields = ('full_name', 'phone', 'license_number')
    if any(not str(data.get(field, '')).strip() for field in fields):
        return jsonify({'success': False, 'message': 'Name, phone and license are required'}), 400
    if Driver.query.filter_by(license_number=data['license_number'].strip()).first():
        return jsonify({'success': False, 'message': 'License already exists'}), 409
    driver = Driver(provider_id=user.id, full_name=data['full_name'].strip(), phone=data['phone'].strip(), license_number=data['license_number'].strip())
    db.session.add(driver)
    db.session.commit()
    return jsonify({'success': True, 'driver': driver.to_dict()}), 201


@logistics_bp.patch('/drivers/<int:driver_id>')
@jwt_required_roles('logistics_provider')
def update_driver(user, driver_id):
    driver = Driver.query.filter_by(id=driver_id, provider_id=user.id).first()
    if driver is None:
        return jsonify({'success': False, 'message': 'Driver not found'}), 404
    data = request.get_json(silent=True) or {}
    for field in ('full_name', 'phone'):
        if field in data and str(data[field]).strip():
            setattr(driver, field, str(data[field]).strip())
    db.session.commit()
    return jsonify({'success': True, 'driver': driver.to_dict()})


@logistics_bp.delete('/drivers/<int:driver_id>')
@jwt_required_roles('logistics_provider')
def delete_driver(user, driver_id):
    driver = Driver.query.filter_by(id=driver_id, provider_id=user.id).first()
    if driver is None:
        return jsonify({'success': False, 'message': 'Driver not found'}), 404
    if not driver.is_available:
        return jsonify({'success': False, 'message': 'Assigned drivers cannot be removed'}), 409
    db.session.delete(driver)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Driver removed'})


@logistics_bp.get('/deliveries')
@jwt_required_roles('logistics_provider', 'admin')
def list_deliveries(user):
    query = Delivery.query if user.role == 'admin' else Delivery.query.filter((Delivery.provider_id == user.id) | (Delivery.provider_id.is_(None)))
    deliveries = query.order_by(Delivery.id.desc()).all()
    return jsonify({'success': True, 'items': [delivery.to_dict() for delivery in deliveries]})


@logistics_bp.post('/deliveries/<int:delivery_id>/accept')
@jwt_required_roles('logistics_provider')
def accept_delivery(user, delivery_id):
    delivery = db.get_or_404(Delivery, delivery_id)
    if delivery.provider_id is not None:
        return jsonify({'success': False, 'message': 'Delivery already accepted'}), 409
    delivery.provider_id = user.id
    delivery.status = 'ACCEPTED'
    db.session.add(TrackingEvent(delivery_id=delivery.id, status='ACCEPTED', note='Delivery accepted by logistics provider'))
    db.session.commit()
    return jsonify({'success': True, 'delivery': delivery.to_dict()})


@logistics_bp.patch('/deliveries/<int:delivery_id>')
@jwt_required_roles('logistics_provider', 'admin')
def update_delivery(user, delivery_id):
    delivery = db.get_or_404(Delivery, delivery_id)
    if user.role != 'admin' and delivery.provider_id != user.id:
        return jsonify({'success': False, 'message': 'You do not manage this delivery'}), 403
    data = request.get_json(silent=True) or {}
    next_status = data.get('status')
    transitions = {'ACCEPTED': {'VEHICLE_ASSIGNED'}, 'VEHICLE_ASSIGNED': {'PICKED_UP'}, 'PICKED_UP': {'IN_TRANSIT'}, 'IN_TRANSIT': {'OUT_FOR_DELIVERY'}, 'OUT_FOR_DELIVERY': {'DELIVERED'}}
    if next_status not in transitions.get(delivery.status, set()):
        return jsonify({'success': False, 'message': 'Invalid delivery status transition'}), 400
    if next_status == 'VEHICLE_ASSIGNED':
        vehicle = Vehicle.query.filter_by(id=data.get('vehicle_id'), provider_id=delivery.provider_id, is_available=True).first()
        driver = Driver.query.filter_by(id=data.get('driver_id'), provider_id=delivery.provider_id, is_available=True).first()
        if not vehicle or not driver:
            return jsonify({'success': False, 'message': 'Available vehicle and driver are required'}), 400
        delivery.vehicle = vehicle
        delivery.driver = driver
        vehicle.is_available = False
        driver.is_available = False
    delivery.status = next_status
    db.session.add(TrackingEvent(delivery_id=delivery.id, status=next_status, note=data.get('note')))
    if next_status == 'DELIVERED':
        delivery.order.status = 'DELIVERED'
        if delivery.order.customer_id:
            db.session.add(Notification(user_id=delivery.order.customer_id, title='Order delivered', message=f'Order #{delivery.order_id} has been delivered.'))
    db.session.commit()
    return jsonify({'success': True, 'delivery': delivery.to_dict()})


@logistics_bp.get('/tracking/<int:order_id>')
@jwt_required_roles('consumer', 'bulk_buyer', 'farmer', 'logistics_provider', 'admin')
def tracking(user, order_id):
    delivery = Delivery.query.filter_by(order_id=order_id).first()
    if delivery is None:
        return jsonify({'success': False, 'message': 'Tracking is not available yet'}), 404
    if user.role == 'consumer' and delivery.order.customer_id != user.id:
        return jsonify({'success': False, 'message': 'You do not have access to this delivery'}), 403
    if user.role == 'farmer' and not any(item.product.farmer_id == user.id for item in delivery.order.items):
        return jsonify({'success': False, 'message': 'You do not have access to this delivery'}), 403
    if user.role == 'logistics_provider' and delivery.provider_id not in (None, user.id):
        return jsonify({'success': False, 'message': 'You do not manage this delivery'}), 403
    return jsonify({'success': True, 'delivery': delivery.to_dict()})
