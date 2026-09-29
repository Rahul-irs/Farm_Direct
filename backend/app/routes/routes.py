import os

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

    if not os.getenv('MAPS_API_KEY'):
        return jsonify({
            'success': False,
            'message': 'Live route estimation is not configured. Set MAPS_API_KEY to enable route calculations.',
            'requires_configuration': True,
            'route': {
                'pickup': pickup,
                'destination': destination,
                'status': 'UNAVAILABLE',
                'provider': 'status-only',
            },
        }), 503

    return jsonify({
        'success': True,
        'route': {
            'pickup': pickup,
            'destination': destination,
            'status': 'READY',
            'provider': 'maps-api',
            'distance_km': None,
            'eta_hours': None,
            'estimated_cost': None,
            'message': 'Maps configuration is present. Route details will be populated by the provider.',
        },
    })