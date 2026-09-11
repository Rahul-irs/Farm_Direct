import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


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
    configured_origins = os.getenv('FRONTEND_URL', '')
    cors_origins = [origin.strip() for origin in configured_origins.split(',') if origin.strip()]
    cors_origins.extend(origin for origin in (
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ) if origin not in cors_origins)
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})

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

    @app.get('/')
    def index():
        return {'message': 'FarmDirect AI backend is running.'}

    @app.get('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app
