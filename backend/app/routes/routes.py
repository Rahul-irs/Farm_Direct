from hashlib import sha256

from flask import Blueprint, jsonify, request

from ..utils.auth import jwt_required_roles

routes_bp = Blueprint('routes_bp', __name__)


@routes_bp.get('/estimate')
@jwt_required_roles('logistics_provider', 'admin')
def estimate_route(user):
    pickup = (request.args.get('pickup') or '').strip()
    destination = (request.args.get('destination') or '').strip()
    if not pickup or not destination:
        return jsonify({'success': False, 'message': 'Pickup and destination are required'}), 400
    seed = int(sha256(f'{pickup}|{destination}'.encode()).hexdigest()[:8], 16)
    distance_km = round(8 + (seed % 4200) / 10, 1)
    return jsonify({'success': True, 'route': {'pickup': pickup, 'destination': destination, 'distance_km': distance_km, 'eta_hours': round(distance_km / 35, 1), 'estimated_cost': round(250 + distance_km * 18, 2), 'provider': 'deterministic-local-estimate'}})