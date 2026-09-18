from flask import Blueprint, jsonify, request
from sqlalchemy import func

from .. import db
from ..models.order import OrderItem
from ..models.product import Product
from ..utils.auth import jwt_required_roles

ai_bp = Blueprint('ai_bp', __name__)


@ai_bp.get('/farmer-insights')
@jwt_required_roles('farmer')
def farmer_insights(user):
    products = Product.query.filter_by(farmer_id=user.id).all()
    insights = []
    for product in products:
        sold = db.session.query(func.coalesce(func.sum(OrderItem.quantity), 0)).filter(OrderItem.product_id == product.id).scalar() or 0
        if product.quantity <= 0:
            recommendation = 'Restock this listing before the next buyer request.'
        elif sold:
            recommendation = 'Demand is active. Review price and reserve stock for repeat buyers.'
        else:
            recommendation = 'Improve the listing image and description to increase discovery.'
        insights.append({'product_id': product.id, 'crop': product.crop, 'current_price': product.price, 'sold_quantity': float(sold), 'recommendation': recommendation})
    return jsonify({'success': True, 'items': insights})


@ai_bp.get('/price-prediction')
def price_prediction():
    crop = (request.args.get('crop') or '').strip()
    location = (request.args.get('location') or '').strip()
    query = Product.query
    if crop:
        query = query.filter(Product.crop.ilike(crop))
    if location:
        query = query.filter(Product.location.ilike(location))
    products = query.all()
    if not products:
        return jsonify({'success': True, 'prediction': None, 'message': 'Insufficient historical data for a reliable prediction.'})
    average_price = sum(product.price for product in products) / len(products)
    sold_quantity = db.session.query(func.coalesce(func.sum(OrderItem.quantity), 0)).join(Product, Product.id == OrderItem.product_id).filter(Product.id.in_([product.id for product in products])).scalar()
    confidence = min(0.95, 0.5 + (0.08 * len(products)) + (0.02 if sold_quantity else 0))
    selected_crop = crop or products[0].crop
    return jsonify({
        'success': True,
        'prediction': {
            'crop': selected_crop,
            'predicted_price': round(average_price, 2),
            'confidence': round(confidence, 2),
            'explanation': f'Calculated from {len(products)} live listing(s) and {sold_quantity:g} kg sold through recorded orders.'
        }
    })


@ai_bp.get('/price-predictions')
def price_predictions():
    products = Product.query.order_by(Product.crop.asc(), Product.id.asc()).all()
    crops = {}
    for product in products:
        crop_name = product.crop.strip() or product.name.strip()
        crops.setdefault(crop_name, []).append(product)
    predictions = []
    for crop_name, crop_products in crops.items():
        product_ids = [product.id for product in crop_products]
        sold_quantity = db.session.query(func.coalesce(func.sum(OrderItem.quantity), 0)).join(Product, Product.id == OrderItem.product_id).filter(Product.id.in_(product_ids)).scalar()
        confidence = min(0.95, 0.5 + (0.08 * len(crop_products)) + (0.02 if sold_quantity else 0))
        average_price = sum(product.price for product in crop_products) / len(crop_products)
        predictions.append({
            'crop': crop_name,
            'predicted_price': round(average_price, 2),
            'confidence': round(confidence, 2),
            'listing_count': len(crop_products),
            'sold_quantity': float(sold_quantity or 0),
            'explanation': f'Based on {len(crop_products)} {crop_name} listing(s) and {sold_quantity:g} kg sold through recorded orders.',
        })
    return jsonify({'success': True, 'predictions': predictions})


@ai_bp.get('/demand-forecast')
def demand_forecast():
    crop = (request.args.get('crop') or '').strip()
    query = db.session.query(func.coalesce(func.sum(OrderItem.quantity), 0), func.count(OrderItem.id)).join(Product, Product.id == OrderItem.product_id)
    if crop:
        query = query.filter(Product.crop.ilike(crop))
    sold_quantity, order_lines = query.one()
    if not order_lines:
        return jsonify({'success': True, 'forecast': None, 'message': 'Insufficient historical order data for a reliable forecast.'})
    observed_demand = float(sold_quantity)
    return jsonify({'success': True, 'forecast': {'crop': crop or 'All crops', 'observed_demand': observed_demand, 'order_lines': order_lines, 'demand_level': 'HIGH' if sold_quantity >= 100 else 'MODERATE' if sold_quantity >= 25 else 'LOW', 'forecasted_7_day': round(observed_demand * 0.35, 2), 'forecasted_30_day': round(observed_demand * 1.2, 2)}})


@ai_bp.get('/supplier-matches')
def supplier_matches():
    crop = (request.args.get('crop') or '').strip()
    minimum_quantity = float(request.args.get('quantity', 0) or 0)
    query = Product.query.filter(Product.quantity >= minimum_quantity)
    if crop:
        query = query.filter(Product.crop.ilike(crop))
    products = query.order_by(Product.price.asc()).limit(20).all()
    return jsonify({'success': True, 'matches': [product.to_dict() for product in products], 'count': len(products)})
