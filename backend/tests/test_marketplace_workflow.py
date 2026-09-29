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


def test_payment_is_processing_after_dev_payment_request(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    monkeypatch.setenv('PAYMENT_PROVIDER', 'development')
    monkeypatch.setenv('ALLOW_DEVELOPMENT_PAYMENTS', 'true')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        farmer = User(full_name='Farmer', email='farmer-payment@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        buyer = User(full_name='Buyer', email='buyer-payment@test.com', password_hash=generate_password_hash('password123'), role='consumer', is_verified=True)
        db.session.add_all([farmer, buyer])
        db.session.commit()
        product = Product(name='Onion', category='Vegetable', crop='Onion', quantity=20, unit='kg', price=15, quality='A', location='Nagpur', farmer_id=farmer.id)
        db.session.add(product)
        db.session.commit()
        product_id = product.id

    buyer_token = client.post('/api/auth/login', json={'email': 'buyer-payment@test.com', 'password': 'password123'}).get_json()['token']
    buyer_headers = {'Authorization': f'Bearer {buyer_token}'}
    client.post('/api/orders/cart/items', json={'product_id': product_id, 'quantity': 2}, headers=buyer_headers)
    order = client.post('/api/orders/', headers=buyer_headers).get_json()['order']

    response = client.post(f"/api/payments/orders/{order['id']}/pay", headers=buyer_headers)

    assert response.status_code == 201
    payload = response.get_json()
    assert payload['order']['status'] == 'PAYMENT_PENDING'
    assert payload['payment']['status'] == 'PROCESSING'


def test_payment_requires_provider_configuration(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    monkeypatch.delenv('PAYMENT_PROVIDER', raising=False)
    monkeypatch.delenv('ALLOW_DEVELOPMENT_PAYMENTS', raising=False)
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        farmer = User(full_name='Farmer', email='farmer-config@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        buyer = User(full_name='Buyer', email='buyer-config@test.com', password_hash=generate_password_hash('password123'), role='consumer', is_verified=True)
        db.session.add_all([farmer, buyer])
        db.session.commit()
        product = Product(name='Peas', category='Vegetable', crop='Peas', quantity=20, unit='kg', price=18, quality='A', location='Indore', farmer_id=farmer.id)
        db.session.add(product)
        db.session.commit()
        product_id = product.id

    buyer_token = client.post('/api/auth/login', json={'email': 'buyer-config@test.com', 'password': 'password123'}).get_json()['token']
    buyer_headers = {'Authorization': f'Bearer {buyer_token}'}
    client.post('/api/orders/cart/items', json={'product_id': product_id, 'quantity': 2}, headers=buyer_headers)
    order = client.post('/api/orders/', headers=buyer_headers).get_json()['order']

    response = client.post(f"/api/payments/orders/{order['id']}/pay", headers=buyer_headers)

    assert response.status_code == 503
    assert response.get_json()['requires_configuration'] is True


def test_farmer_cannot_delete_paid_order(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    monkeypatch.setenv('PAYMENT_PROVIDER', 'development')
    monkeypatch.setenv('ALLOW_DEVELOPMENT_PAYMENTS', 'true')
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


def test_bulk_requirement_reports_shortage_when_total_supply_is_insufficient(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        buyer = User(full_name='Bulk Buyer', email='bulk-shortage@test.com', password_hash=generate_password_hash('password123'), role='bulk_buyer', is_verified=True)
        farmer = User(full_name='Farmer', email='bulk-farmer@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        db.session.add_all([buyer, farmer])
        db.session.commit()
        db.session.add(Product(name='Tomato', category='Vegetable', crop='Tomato', quantity=650, unit='kg', price=24, quality='Grade A', location='Guntur', farmer_id=farmer.id))
        db.session.commit()

    token = client.post('/api/auth/login', json={'email': 'bulk-shortage@test.com', 'password': 'password123'}).get_json()['token']
    response = client.post('/api/partners/bulk/requirements', json={'crop': 'Tomato', 'location': 'Guntur', 'quantity': 1000}, headers={'Authorization': f'Bearer {token}'})
    requirement_id = response.get_json()['requirement']['id']
    matches = client.get(f'/api/partners/bulk/requirements/{requirement_id}/matches', headers={'Authorization': f'Bearer {token}'})

    assert matches.status_code == 200
    payload = matches.get_json()
    assert payload['total_available'] == 650
    assert payload['shortage'] == 350
    assert payload['matched_quantity'] == 650
    assert payload['is_fully_matched'] is False


def test_logout_route_and_order_cancellation_restore_inventory(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        farmer = User(full_name='Farmer', email='farmer-cancel@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        buyer = User(full_name='Buyer', email='buyer-cancel@test.com', password_hash=generate_password_hash('password123'), role='consumer', is_verified=True)
        db.session.add_all([farmer, buyer])
        db.session.commit()
        product = Product(name='Capsicum', category='Vegetable', crop='Capsicum', quantity=12, unit='kg', price=22, quality='A', location='Bhopal', farmer_id=farmer.id)
        db.session.add(product)
        db.session.commit()
        product_id = product.id

    buyer_token = client.post('/api/auth/login', json={'email': 'buyer-cancel@test.com', 'password': 'password123'}).get_json()['token']
    buyer_headers = {'Authorization': f'Bearer {buyer_token}'}
    assert client.post('/api/orders/cart/items', json={'product_id': product_id, 'quantity': 3}, headers=buyer_headers).status_code == 201
    order = client.post('/api/orders/', headers=buyer_headers).get_json()['order']

    farmer_token = client.post('/api/auth/login', json={'email': 'farmer-cancel@test.com', 'password': 'password123'}).get_json()['token']
    logout_response = client.post('/api/auth/logout', headers={'Authorization': f'Bearer {farmer_token}'})
    assert logout_response.status_code == 200

    delete_response = client.delete(f"/api/orders/{order['id']}", headers={'Authorization': f'Bearer {farmer_token}'})
    assert delete_response.status_code == 200
    with app.app_context():
        assert db.session.get(Product, product_id).quantity == 12


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
