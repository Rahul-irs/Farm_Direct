from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User


def _create_ai_test_app(monkeypatch, with_data=True):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        farmer = User(
            full_name='AI Farmer',
            email='ai-farmer@test.com',
            password_hash=generate_password_hash('password123'),
            role='farmer',
            is_verified=True,
        )
        buyer = User(
            full_name='AI Buyer',
            email='ai-buyer@test.com',
            password_hash=generate_password_hash('password123'),
            role='consumer',
            is_verified=True,
        )
        db.session.add_all([farmer, buyer])
        db.session.commit()
        farmer_id = farmer.id

        if with_data:
            guntur_tomato = Product(name='Tomato A', category='Vegetable', crop='Tomato', quantity=50, price=20, location='Guntur', farmer_id=farmer.id)
            pune_tomato = Product(name='Tomato B', category='Vegetable', crop='Tomato', quantity=40, price=30, location='Pune', farmer_id=farmer.id)
            inactive_tomato = Product(name='Tomato Paused', category='Vegetable', crop='Tomato', quantity=100, price=2, location='Guntur', farmer_id=farmer.id, is_active=False)
            db.session.add_all([guntur_tomato, pune_tomato, inactive_tomato])
            db.session.commit()

            paid_order = Order(customer_id=buyer.id, total_amount=400, status='PAID')
            cancelled_order = Order(customer_id=buyer.id, total_amount=2000, status='CANCELLED')
            db.session.add_all([paid_order, cancelled_order])
            db.session.commit()
            db.session.add_all([
                OrderItem(order_id=paid_order.id, product_id=guntur_tomato.id, quantity=20, unit_price=20),
                OrderItem(order_id=paid_order.id, product_id=pune_tomato.id, quantity=10, unit_price=30),
                OrderItem(order_id=cancelled_order.id, product_id=guntur_tomato.id, quantity=100, unit_price=20),
            ])
            db.session.commit()

    farmer_token = client.post('/api/auth/login', json={
        'email': 'ai-farmer@test.com',
        'password': 'password123',
    }).get_json()['token']
    return app, client, farmer_id, {'Authorization': f'Bearer {farmer_token}'}


def test_ai_endpoints_return_filtered_live_results(monkeypatch):
    _, client, _, farmer_headers = _create_ai_test_app(monkeypatch)

    insights = client.get('/api/ai/farmer-insights', headers=farmer_headers)
    assert insights.status_code == 200
    tomato_insight = next(item for item in insights.get_json()['items'] if item['crop'] == 'Tomato')
    assert tomato_insight['sold_quantity'] == 20

    prediction = client.get('/api/ai/price-prediction?crop=tomato&location=guntur')
    assert prediction.status_code == 200
    assert prediction.get_json()['prediction']['predicted_price'] == 20
    assert '1 live listing' in prediction.get_json()['prediction']['explanation']

    predictions = client.get('/api/ai/price-predictions')
    tomato_prediction = next(item for item in predictions.get_json()['predictions'] if item['crop'] == 'Tomato')
    assert tomato_prediction['predicted_price'] == 25
    assert tomato_prediction['listing_count'] == 2
    assert tomato_prediction['sold_quantity'] == 30

    forecast = client.get('/api/ai/demand-forecast?crop=Tomato&location=Guntur')
    assert forecast.status_code == 200
    assert forecast.get_json()['forecast']['observed_demand'] == 20
    assert forecast.get_json()['forecast']['order_lines'] == 1
    all_locations = client.get('/api/ai/demand-forecast?crop=Tomato')
    assert all_locations.get_json()['forecast']['observed_demand'] == 30
    assert all_locations.get_json()['forecast']['order_lines'] == 2

    matches = client.get('/api/ai/supplier-matches?crop=Tomato&quantity=30')
    assert matches.status_code == 200
    assert matches.get_json()['count'] == 2
    assert all(item['is_active'] for item in matches.get_json()['matches'])


def test_ai_endpoints_handle_empty_data_and_require_farmer_role(monkeypatch):
    _, client, _, farmer_headers = _create_ai_test_app(monkeypatch, with_data=False)

    assert client.get('/api/ai/price-prediction').get_json()['prediction'] is None
    assert client.get('/api/ai/price-predictions').get_json()['predictions'] == []
    assert client.get('/api/ai/demand-forecast').get_json()['forecast'] is None
    assert client.get('/api/ai/supplier-matches').get_json()['matches'] == []
    assert client.get('/api/ai/farmer-insights', headers=farmer_headers).get_json()['items'] == []
    assert client.get('/api/ai/farmer-insights').status_code == 401


def test_supplier_matches_reject_invalid_quantities(monkeypatch):
    _, client, _, _ = _create_ai_test_app(monkeypatch)

    for quantity in ('abc', '-1', 'nan', 'inf'):
        response = client.get(f'/api/ai/supplier-matches?quantity={quantity}')
        assert response.status_code == 400
        assert response.get_json()['success'] is False