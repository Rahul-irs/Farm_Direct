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


def test_farmer_cannot_delete_paid_order(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        farmer = User(full_name='Farmer', email='farmer-delete@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        buyer = User(full_name='Buyer', email='buyer-delete@test.com', password_hash=generate_password_hash('password123'), role='consumer', is_verified=True)
        db.session.add_all([farmer, buyer])
        db.session.commit()
        product = Product(name='Rice', category='Grain', crop='Rice', quantity=10, unit='kg', price=50, quality='A', location='Pune', farmer_id=farmer.id)
        db.session.add(product)
        db.session.commit()
        product_id = product.id

    buyer_token = client.post('/api/auth/login', json={'email': 'buyer-delete@test.com', 'password': 'password123'}).get_json()['token']
    buyer_headers = {'Authorization': f'Bearer {buyer_token}'}
    client.post('/api/orders/cart/items', json={'product_id': product_id, 'quantity': 1}, headers=buyer_headers)
    order = client.post('/api/orders/', headers=buyer_headers).get_json()['order']
    assert client.post(f"/api/payments/orders/{order['id']}/pay", headers=buyer_headers).status_code == 201

    farmer_token = client.post('/api/auth/login', json={'email': 'farmer-delete@test.com', 'password': 'password123'}).get_json()['token']
    response = client.delete(f"/api/orders/{order['id']}", headers={'Authorization': f'Bearer {farmer_token}'})

    assert response.status_code == 409
    assert response.get_json()['message'] == 'Processed orders are retained for fulfilment and earnings history'


def test_login_accepts_copied_demo_email_with_whitespace(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        db.session.add(User(full_name='Demo Buyer', email='buyer@farmdirect.ai', password_hash=generate_password_hash('demo12345'), role='bulk_buyer', is_verified=True))
        db.session.commit()

    response = client.post('/api/auth/login', json={'email': ' buyer@farmdirect.ai ', 'password': 'demo12345'})

    assert response.status_code == 200
    assert response.get_json()['user']['email'] == 'buyer@farmdirect.ai'


def test_profile_updates_persist_after_logout_and_relogin(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        db.session.add(User(
            full_name='Ramesh Kumar',
            email='farmer@test.com',
            phone='+91 98765 43210',
            password_hash=generate_password_hash('password123'),
            role='farmer',
            is_verified=True,
        ))
        db.session.commit()

    token = client.post('/api/auth/login', json={'email': 'farmer@test.com', 'password': 'password123'}).get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}
    response = client.patch('/api/auth/me', json={
        'full_name': 'Ramesh Updated',
        'phone': '+91 99999 11111',
        'email': 'updatedfarmer@test.com',
        'address': 'Main Road, Guntur',
        'village': 'Venkateswarapuram',
        'mandal': 'Guntur',
        'district': 'Guntur',
        'state': 'Andhra Pradesh',
        'language': 'Telugu',
        'bank_details': 'SBI - 1234 **** 5678',
        'notifications_enabled': False,
        'location_tracking': True,
        'farm_profile': {
            'farm_name': 'Sunrise Organics',
            'location': 'Venkateswarapuram, Guntur',
            'size': '3.5 Acres',
            'soil_type': 'Black Soil',
            'irrigation_type': 'Drip Irrigation',
            'farming_method': 'Organic',
            'expected_harvest': 'Oct 2025',
            'crops_grown': 'Tomato, Chilli, Rice',
        },
    }, headers=headers)

    assert response.status_code == 200
    data = response.get_json()['user']
    assert data['full_name'] == 'Ramesh Updated'
    assert data['address'] == 'Main Road, Guntur'
    assert data['email'] == 'updatedfarmer@test.com'
    assert data['farm_profile']['soil_type'] == 'Black Soil'
    assert data['farm_profile']['crops_grown'] == 'Tomato, Chilli, Rice'
    assert data['profile_data']['notifications_enabled'] is False
    assert data['profile_data']['location_tracking'] is True

    relogin = client.post('/api/auth/login', json={'email': 'updatedfarmer@test.com', 'password': 'password123'})
    assert relogin.status_code == 200
    user = relogin.get_json()['user']
    assert user['full_name'] == 'Ramesh Updated'
    assert user['phone'] == '+91 99999 11111'
    assert user['address'] == 'Main Road, Guntur'
    assert user['farm_profile']['irrigation_type'] == 'Drip Irrigation'
    assert user['profile_data']['notifications_enabled'] is False
