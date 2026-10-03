from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User


def test_delivered_order_can_be_reviewed_once_by_its_buyer(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'sqlite:///:memory:')
    app = create_app()
    app.config.update(TESTING=True)
    client = app.test_client()

    with app.app_context():
        db.create_all()
        buyer = User(full_name='Buyer', email='review-buyer@test.com', password_hash=generate_password_hash('password123'), role='consumer', is_verified=True)
        farmer = User(full_name='Farmer', email='review-farmer@test.com', password_hash=generate_password_hash('password123'), role='farmer', is_verified=True)
        db.session.add_all([buyer, farmer])
        db.session.commit()
        product = Product(name='Tomato', category='Vegetable', crop='Tomato', quantity=10, price=20, location='Guntur', farmer_id=farmer.id)
        db.session.add(product)
        db.session.commit()
        order = Order(customer_id=buyer.id, total_amount=40, status='DELIVERED')
        db.session.add(order)
        db.session.commit()
        db.session.add(OrderItem(order_id=order.id, product_id=product.id, quantity=2, unit_price=20))
        db.session.commit()
        product_id = product.id
        order_id = order.id

    token = client.post('/api/auth/login', json={'email': 'review-buyer@test.com', 'password': 'password123'}).get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}
    review = {'product_id': product_id, 'order_id': order_id, 'rating': 5, 'comment': 'Fresh and on time'}

    response = client.post('/api/reviews/', json=review, headers=headers)
    assert response.status_code == 201
    duplicate = client.post('/api/reviews/', json=review, headers=headers)
    assert duplicate.status_code == 409