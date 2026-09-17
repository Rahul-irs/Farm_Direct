import os
from flask import Flask, send_from_directory
from sqlalchemy import inspect, text
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def _ensure_runtime_schema():
    """Apply the small compatibility additions used by the current models."""
    inspector = inspect(db.engine)
    if not inspector.has_table('users') or not inspector.has_table('products'):
        return
    user_columns = {column['name'] for column in inspector.get_columns('users')}
    product_columns = {column['name'] for column in inspector.get_columns('products')}
    statements = []
    if 'farm_profile' not in user_columns:
        statements.append("ALTER TABLE users ADD COLUMN farm_profile JSONB")
    if 'profile_data' not in user_columns:
        statements.append("ALTER TABLE users ADD COLUMN profile_data JSONB")
    if 'is_active' not in product_columns:
        statements.append("ALTER TABLE products ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE")
    statements.append("CREATE TABLE IF NOT EXISTS wishlist_items (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), product_id INTEGER NOT NULL REFERENCES products(id), CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id))")
    for statement in statements:
        db.session.execute(text(statement))
    if statements:
        db.session.commit()


def create_app() -> Flask:
    app = Flask(__name__)
    database_url = os.getenv('DATABASE_URL')
    test_sqlite = database_url and database_url.startswith('sqlite://') and os.getenv('PYTEST_CURRENT_TEST')
    if not database_url or (not database_url.startswith(('postgresql://', 'postgresql+psycopg2://')) and not test_sqlite):
        raise RuntimeError('DATABASE_URL must be a PostgreSQL connection string')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-only-farmdirect-secret-key-change-me')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 7 * 24 * 60 * 60
    app.config['JSON_SORT_KEYS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(app.instance_path, 'uploads')
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', '587'))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    with app.app_context():
        _ensure_runtime_schema()
    configured_origins = os.getenv('FRONTEND_URL', '')
    cors_origins = [origin.strip() for origin in configured_origins.split(',') if origin.strip()]
    cors_origins.extend(origin for origin in (
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ) if origin not in cors_origins)
    # React development servers are often opened through the machine's LAN IP.
    # JWTs are sent in headers, so credentials are not needed for this local CORS policy.
    local_dev_origins = r'^https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):\d+$'
    CORS(app, resources={r"/api/*": {'origins': [*cors_origins, local_dev_origins], 'allow_headers': ['Content-Type', 'Authorization']}})

    from .routes.auth import auth_bp
    from .routes.products import products_bp
    from .routes.orders import orders_bp
    from .routes.admin import admin_bp
    from .routes.ai import ai_bp
    from .routes.payments import payments_bp
    from .routes.notifications import notifications_bp
    from .routes.logistics import logistics_bp
    from .routes.reviews import reviews_bp
    from .routes.partners import partners_bp
    from .routes.wishlist import wishlist_bp
    from .routes.routes import routes_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(logistics_bp, url_prefix='/api/logistics')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(partners_bp, url_prefix='/api/partners')
    app.register_blueprint(routes_bp, url_prefix='/api/routes')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')

    @app.get('/')
    def index():
        return {'message': 'FarmDirect AI backend is running.'}

    @app.get('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app
