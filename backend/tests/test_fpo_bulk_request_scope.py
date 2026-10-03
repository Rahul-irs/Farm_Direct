from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models.partners import BulkRequirement, FPOMembership
from app.models.product import Product
from app.models.user import User


def test_fpo_bulk_requests_are_scoped_to_active_member_supply(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        first_fpo = User(full_name='First FPO', email='first-fpo@test.com', password_hash=generate_password_hash('password123'), role='fpo', is_verified=True)
        second_fpo = User(full_name='Second FPO', email='second-fpo@test.com', password_hash=generate_password_hash('password123'), role='fpo', is_verified=True)
        first_farmer = User(full_name='Tomato Farmer', email='tomato-farmer@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        second_farmer = User(full_name='Rice Farmer', email='rice-farmer@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        buyer = User(full_name='Buyer', email='buyer-fpo-scope@test.com', password_hash=generate_password_hash('password123'), role='bulk_buyer', is_verified=True)
        db.session.add_all([first_fpo, second_fpo, first_farmer, second_farmer, buyer])
        db.session.commit()

        tomato = Product(name='Tomato', category='Vegetable', crop='Tomato', quantity=100, price=20, location='Guntur', farmer_id=first_farmer.id)
        rice = Product(name='Rice', category='Grain', crop='Rice', quantity=100, price=40, location='Nellore', farmer_id=second_farmer.id)
        db.session.add_all([
            FPOMembership(fpo_id=first_fpo.id, farmer_id=first_farmer.id),
            FPOMembership(fpo_id=second_fpo.id, farmer_id=second_farmer.id),
            tomato,
            rice,
        ])
        db.session.commit()
        tomato_request = BulkRequirement(buyer_id=buyer.id, crop='Tomato', quantity=50, location='Guntur')
        rice_request = BulkRequirement(buyer_id=buyer.id, crop='Rice', quantity=50, location='Nellore')
        db.session.add_all([tomato_request, rice_request])
        db.session.commit()
        tomato_request_id = tomato_request.id
        rice_request_id = rice_request.id
        tomato_product_id = tomato.id

    token = client.post('/api/auth/login', json={'email': 'first-fpo@test.com', 'password': 'password123'}).get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    response = client.get('/api/partners/fpo/bulk-buyers', headers=headers)
    assert response.status_code == 200
    assert [item['id'] for item in response.get_json()['items']] == [tomato_request_id]
    assert client.patch(f'/api/partners/fpo/bulk-buyers/{tomato_request_id}', json={'status': 'ACCEPTED'}, headers=headers).status_code == 200
    assert client.patch(f'/api/partners/fpo/bulk-buyers/{rice_request_id}', json={'status': 'ACCEPTED'}, headers=headers).status_code == 404

    with app.app_context():
        db.session.get(Product, tomato_product_id).quantity = 0
        db.session.commit()
    assert [item['id'] for item in client.get('/api/partners/fpo/bulk-buyers', headers=headers).get_json()['items']] == [tomato_request_id]