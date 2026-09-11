from .base import db


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    registration_number = db.Column(db.String(40), unique=True, nullable=False)
    vehicle_type = db.Column(db.String(60), nullable=False)
    capacity_kg = db.Column(db.Float, nullable=False)
    is_available = db.Column(db.Boolean, default=True, nullable=False)

    def to_dict(self):
        return {'id': self.id, 'provider_id': self.provider_id, 'registration_number': self.registration_number, 'vehicle_type': self.vehicle_type, 'capacity_kg': self.capacity_kg, 'is_available': self.is_available}


class Driver(db.Model):
    __tablename__ = 'drivers'

    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    license_number = db.Column(db.String(80), unique=True, nullable=False)
    is_available = db.Column(db.Boolean, default=True, nullable=False)

    def to_dict(self):
        return {'id': self.id, 'provider_id': self.provider_id, 'full_name': self.full_name, 'phone': self.phone, 'license_number': self.license_number, 'is_available': self.is_available}


class Delivery(db.Model):
    __tablename__ = 'deliveries'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), unique=True, nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=True)
    pickup_location = db.Column(db.String(160), nullable=False)
    destination = db.Column(db.String(160), nullable=False)
    status = db.Column(db.String(40), default='AVAILABLE', nullable=False)
    order = db.relationship('Order')
    vehicle = db.relationship('Vehicle')
    driver = db.relationship('Driver')
    events = db.relationship('TrackingEvent', backref='delivery', cascade='all, delete-orphan', order_by='TrackingEvent.id')

    def to_dict(self):
        return {'id': self.id, 'order_id': self.order_id, 'provider_id': self.provider_id, 'vehicle_id': self.vehicle_id, 'driver_id': self.driver_id, 'pickup_location': self.pickup_location, 'destination': self.destination, 'status': self.status, 'vehicle': self.vehicle.to_dict() if self.vehicle else None, 'driver': self.driver.to_dict() if self.driver else None, 'events': [event.to_dict() for event in self.events]}


class TrackingEvent(db.Model):
    __tablename__ = 'tracking_events'

    id = db.Column(db.Integer, primary_key=True)
    delivery_id = db.Column(db.Integer, db.ForeignKey('deliveries.id'), nullable=False)
    status = db.Column(db.String(40), nullable=False)
    note = db.Column(db.String(240), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {'id': self.id, 'status': self.status, 'note': self.note, 'created_at': self.created_at.isoformat() if self.created_at else None}
