from app import create_app, db
from app.models.user import User
from app.models.product import Product
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    admin = User(
        full_name='Admin User',
        email='admin@farmdirect.ai',
        phone='9999999999',
        password_hash=generate_password_hash('admin123'),
        role='admin',
        is_verified=True,
    )
    farmer = User(
        full_name='Demo Farmer',
        email='farmer@farmdirect.ai',
        phone='8888888888',
        password_hash=generate_password_hash('farmer123'),
        role='farmer',
        is_verified=True,
    )
    consumer = User(
        full_name='Demo Consumer',
        email='consumer@farmdirect.ai',
        phone='7777777777',
        password_hash=generate_password_hash('consumer123'),
        role='consumer',
        is_verified=True,
    )
    db.session.add_all([admin, farmer, consumer])
    db.session.commit()

    db.session.add(
        Product(
            name='Tomato',
            category='Vegetable',
            crop='Tomato',
            description='Fresh tomatoes',
            quantity=1000,
            unit='kg',
            price=28,
            quality='Grade A',
            location='Bengaluru',
            farmer_id=farmer.id,
        )
    )
    db.session.commit()

client = app.test_client()
auth_me = client.get('/api/auth/me')
print('ME', auth_me.status_code, auth_me.get_json()['message'])

reg = client.post(
    '/api/auth/register',
    json={'full_name': 'New Buyer', 'email': 'buyer@test.com', 'password': 'buyer123', 'role': 'consumer'},
)
print('REGISTER', reg.status_code, reg.get_json()['message'])

login = client.post('/api/auth/login', json={'email': 'farmer@farmdirect.ai', 'password': 'farmer123'})
print('LOGIN', login.status_code, login.get_json()['message'])
admin_login = client.post('/api/auth/login', json={'email': 'admin@farmdirect.ai', 'password': 'admin123'})
admin_headers = {'Authorization': f"Bearer {admin_login.get_json()['token']}"}

products = client.get('/api/products/')
print('PRODUCTS', products.status_code, products.get_json()['count'])

admin_overview = client.get('/api/admin/overview', headers=admin_headers)
print('ADMIN', admin_overview.status_code, admin_overview.get_json()['data'])

unauthorized_admin = client.get('/api/admin/overview')
print('ADMIN_UNAUTHORIZED', unauthorized_admin.status_code)

ai = client.get('/api/ai/price-prediction')
print('AI', ai.status_code, ai.get_json()['prediction']['crop'])
