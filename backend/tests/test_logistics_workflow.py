from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models.logistics import Delivery
from app.models.order import Order
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
