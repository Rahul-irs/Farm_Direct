from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models.logistics import Delivery
from app.models.order import Order
from app.models.product import Product
from app.models.user import User


def test_provider_can_accept_delivery(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    with app.app_context():
        db.create_all()
        buyer = User(full_name='Buyer', email='buyer-logistics@test.com', password_hash=generate_password_hash('password123'), role='consumer', is_verified=True)
        provider = User(full_name='Provider', email='provider-logistics@test.com', password_hash=generate_password_hash('password123'), role='logistics_provider', is_verified=True)
        db.session.add_all([buyer, provider])
        db.session.commit()
        order = Order(customer_id=buyer.id, total_amount=100, status='LOGISTICS_REQUESTED')
        db.session.add(order)
        db.session.commit()
        delivery = Delivery(order_id=order.id, pickup_location='Nashik', destination='Pune')
        db.session.add(delivery)
        db.session.commit()
        delivery_id = delivery.id

    client = app.test_client()
    token = client.post('/api/auth/login', json={'email': 'provider-logistics@test.com', 'password': 'password123'}).get_json()['token']
    response = client.post(f'/api/logistics/deliveries/{delivery_id}/accept', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert response.get_json()['delivery']['status'] == 'ACCEPTED'


def test_paid_order_can_move_from_farmer_to_logistics(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    with app.app_context():
        db.create_all()
        farmer = User(full_name='Farmer', email='farmer-handoff@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        buyer = User(full_name='Buyer', email='buyer-handoff@test.com', password_hash=generate_password_hash('password123'), role='consumer', is_verified=True)
        db.session.add_all([farmer, buyer])
        db.session.commit()
        product = Product(name='Onion', category='Vegetable', crop='Onion', quantity=20, unit='kg', price=30, quality='A', location='Nashik', farmer_id=farmer.id)
        db.session.add(product)
        db.session.commit()
        product_id = product.id

    client = app.test_client()
    buyer_token = client.post('/api/auth/login', json={'email': 'buyer-handoff@test.com', 'password': 'password123'}).get_json()['token']
    buyer_headers = {'Authorization': f'Bearer {buyer_token}'}
    assert client.post('/api/orders/cart/items', json={'product_id': product_id, 'quantity': 2}, headers=buyer_headers).status_code == 201
    order = client.post('/api/orders/', headers=buyer_headers).get_json()['order']
    assert client.post(f"/api/payments/orders/{order['id']}/pay", headers=buyer_headers).status_code == 201

    with app.app_context():
        assert db.session.get(Order, order['id']).status == 'PAID'

    farmer_token = client.post('/api/auth/login', json={'email': 'farmer-handoff@test.com', 'password': 'password123'}).get_json()['token']
    farmer_headers = {'Authorization': f'Bearer {farmer_token}'}
    assert client.patch(f"/api/orders/{order['id']}/status", json={'status': 'CONFIRMED'}, headers=farmer_headers).status_code == 200
    logistics_response = client.patch(f"/api/orders/{order['id']}/status", json={'status': 'LOGISTICS_REQUESTED'}, headers=farmer_headers)

    assert logistics_response.status_code == 200
    with app.app_context():
        delivery = Delivery.query.filter_by(order_id=order['id']).first()
        assert delivery is not None
        assert delivery.status == 'AVAILABLE'
