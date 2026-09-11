from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models.product import Product
from app.models.user import User


def test_checkout_uses_server_price_and_reduces_inventory(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        farmer = User(full_name='Farmer', email='farmer@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        buyer = User(full_name='Buyer', email='buyer@test.com', password_hash=generate_password_hash('password123'), role='consumer', is_verified=True)
        db.session.add_all([farmer, buyer])
        db.session.commit()
        product = Product(name='Beans', category='Vegetable', crop='Beans', quantity=10, unit='kg', price=20, quality='A', location='Pune', farmer_id=farmer.id)
        db.session.add(product)
        db.session.commit()
        product_id = product.id

    token = client.post('/api/auth/login', json={'email': 'buyer@test.com', 'password': 'password123'}).get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}
    assert client.post('/api/orders/cart/items', json={'product_id': product_id, 'quantity': 3}, headers=headers).status_code == 201
    response = client.post('/api/orders/', headers=headers)

    assert response.status_code == 201
    assert response.get_json()['order']['total_amount'] == 60.0
    with app.app_context():
        assert db.session.get(Product, product_id).quantity == 7
