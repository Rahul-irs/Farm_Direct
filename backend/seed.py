"""Create a repeatable local demo scenario for presentations and development."""

from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models.audit import AuditLog
from app.models.logistics import Delivery, Driver, TrackingEvent, Vehicle
from app.models.notification import Notification
from app.models.order import Order, OrderItem
from app.models.partners import BulkRequirement, FieldAssignment, FPOAggregation, FPOMembership
from app.models.payment import Payment
from app.models.product import Product
from app.models.review import Review
from app.models.user import User

app = create_app()
DEMO_PASSWORD = 'demo12345'


def get_or_create_user(email, full_name, role, phone):
    user = User.query.filter_by(email=email).first()
    if user:
        user.password_hash = generate_password_hash(DEMO_PASSWORD)
        user.is_verified = True
        return user
    user = User(full_name=full_name, email=email, phone=phone, role=role, password_hash=generate_password_hash(DEMO_PASSWORD), is_verified=True)
    db.session.add(user)
    db.session.flush()
    return user


with app.app_context():
    db.create_all()

    admin = get_or_create_user('admin@farmdirect.ai', 'Asha Admin', 'admin', '9000000001')
    farmer = get_or_create_user('farmer@farmdirect.ai', 'Ravi Kumar', 'farmer', '9000000002')
    second_farmer = get_or_create_user('farmer2@farmdirect.ai', 'Meena Patel', 'farmer', '9000000003')
    consumer = get_or_create_user('consumer@farmdirect.ai', 'Anita Shah', 'consumer', '9000000004')
    fpo = get_or_create_user('fpo@farmdirect.ai', 'Green Valley FPO', 'fpo', '9000000005')
    assistant = get_or_create_user('assistant@farmdirect.ai', 'Suresh Field Assistant', 'field_assistant', '9000000006')
    buyer = get_or_create_user('buyer@farmdirect.ai', 'FreshMart Bulk Buyer', 'bulk_buyer', '9000000007')
    logistics = get_or_create_user('logistics@farmdirect.ai', 'SwiftRoute Logistics', 'logistics_provider', '9000000008')

    product_specs = [
        ('Tomato', 'Vegetable', 'Tomato', 1000, 28, 'Bengaluru', farmer),
        ('Rice', 'Grain', 'Rice', 500, 42, 'Hyderabad', farmer),
        ('Onion', 'Vegetable', 'Onion', 750, 32, 'Nashik', second_farmer),
        ('Mango', 'Fruit', 'Mango', 300, 85, 'Ratnagiri', second_farmer),
    ]
    products = []
    for name, category, crop, quantity, price, location, owner in product_specs:
        product = Product.query.filter_by(name=name, farmer_id=owner.id).first()
        if not product:
            product = Product(name=name, category=category, crop=crop, description=f'Demo {name.lower()} from {location}', quantity=quantity, unit='kg', price=price, quality='Grade A', location=location, farmer_id=owner.id)
            db.session.add(product)
            db.session.flush()
        products.append(product)
    tomato, rice, onion, mango = products

    if not FPOMembership.query.filter_by(fpo_id=fpo.id, farmer_id=farmer.id).first():
        db.session.add(FPOMembership(fpo_id=fpo.id, farmer_id=farmer.id))
    if not FPOMembership.query.filter_by(fpo_id=fpo.id, farmer_id=second_farmer.id).first():
        db.session.add(FPOMembership(fpo_id=fpo.id, farmer_id=second_farmer.id))
    if not FPOAggregation.query.filter_by(fpo_id=fpo.id, crop='Tomato').first():
        db.session.add(FPOAggregation(fpo_id=fpo.id, crop='Tomato', quantity=1200))
    if not FieldAssignment.query.filter_by(assistant_id=assistant.id, farmer_id=farmer.id).first():
        db.session.add(FieldAssignment(assistant_id=assistant.id, farmer_id=farmer.id))
    if not BulkRequirement.query.filter_by(buyer_id=buyer.id, crop='Onion').first():
        db.session.add(BulkRequirement(buyer_id=buyer.id, crop='Onion', quantity=200, location='Mumbai'))

    order = Order.query.filter_by(customer_id=consumer.id).first()
    if not order:
        order = Order(customer_id=consumer.id, total_amount=280, status='COMPLETED')
        db.session.add(order)
        db.session.flush()
        db.session.add(OrderItem(order_id=order.id, product_id=tomato.id, quantity=10, unit_price=28))
        tomato.quantity -= 10
    if not Payment.query.filter_by(order_id=order.id).first():
        db.session.add(Payment(order_id=order.id, customer_id=consumer.id, amount=order.total_amount, provider='development', status='SUCCEEDED', transaction_reference=f'DEMO-{order.id:05d}'))
    if not Review.query.filter_by(product_id=tomato.id, customer_id=consumer.id, order_id=order.id).first():
        db.session.add(Review(product_id=tomato.id, customer_id=consumer.id, order_id=order.id, rating=5, comment='Fresh, well-packed tomatoes.'))

    vehicle = Vehicle.query.filter_by(registration_number='KA-01-FD-2026').first()
    if not vehicle:
        vehicle = Vehicle(provider_id=logistics.id, registration_number='KA-01-FD-2026', vehicle_type='Refrigerated mini truck', capacity_kg=1200)
        db.session.add(vehicle)
        db.session.flush()
    driver = Driver.query.filter_by(license_number='DL-FD-2026-001').first()
    if not driver:
        driver = Driver(provider_id=logistics.id, full_name='Kiran Rao', phone='9000000010', license_number='DL-FD-2026-001')
        db.session.add(driver)
        db.session.flush()
    delivery = Delivery.query.filter_by(order_id=order.id).first()
    if not delivery:
        delivery = Delivery(order_id=order.id, provider_id=logistics.id, vehicle_id=vehicle.id, driver_id=driver.id, pickup_location='Bengaluru farm hub', destination='Anita Shah, Bengaluru', status='DELIVERED')
        db.session.add(delivery)
        db.session.flush()
        for status, note in [('AVAILABLE', 'Delivery request created'), ('ACCEPTED', 'SwiftRoute accepted the delivery'), ('VEHICLE_ASSIGNED', 'Vehicle and driver assigned'), ('PICKED_UP', 'Produce collected from farm hub'), ('IN_TRANSIT', 'Shipment is moving to the customer'), ('DELIVERED', 'Customer delivery completed')]:
            db.session.add(TrackingEvent(delivery_id=delivery.id, status=status, note=note))
    if not Notification.query.filter_by(user_id=consumer.id, title='Demo order delivered').first():
        db.session.add(Notification(user_id=consumer.id, title='Demo order delivered', message=f'Order #{order.id} was delivered successfully.'))
    if not Notification.query.filter_by(user_id=farmer.id, title='Demo sale received').first():
        db.session.add(Notification(user_id=farmer.id, title='Demo sale received', message=f'Your tomatoes were included in completed order #{order.id}.'))
    if not AuditLog.query.filter_by(action='demo_seed_created').first():
        db.session.add(AuditLog(actor_id=admin.id, action='demo_seed_created', target_type='scenario', details='Created the FarmDirect real-world demonstration dataset.'))

    db.session.commit()
    print('Demo data seeded. All demo passwords are: demo12345')
