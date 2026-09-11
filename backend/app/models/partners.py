from .base import db


class FPOMembership(db.Model):
    __tablename__ = 'fpo_memberships'
    id = db.Column(db.Integer, primary_key=True)
    fpo_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(30), default='ACTIVE', nullable=False)
    __table_args__ = (db.UniqueConstraint('fpo_id', 'farmer_id', name='uq_fpo_farmer'),)

    def to_dict(self):
        return {'id': self.id, 'fpo_id': self.fpo_id, 'farmer_id': self.farmer_id, 'status': self.status}


class FieldAssignment(db.Model):
    __tablename__ = 'field_assignments'
    id = db.Column(db.Integer, primary_key=True)
    assistant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(30), default='ACTIVE', nullable=False)
    __table_args__ = (db.UniqueConstraint('assistant_id', 'farmer_id', name='uq_assistant_farmer'),)

    def to_dict(self):
        return {'id': self.id, 'assistant_id': self.assistant_id, 'farmer_id': self.farmer_id, 'status': self.status}


class BulkRequirement(db.Model):
    __tablename__ = 'bulk_requirements'
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    crop = db.Column(db.String(80), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(30), default='OPEN', nullable=False)

    def to_dict(self):
        return {'id': self.id, 'buyer_id': self.buyer_id, 'crop': self.crop, 'quantity': self.quantity, 'location': self.location, 'status': self.status}


class FPOAggregation(db.Model):
    __tablename__ = 'fpo_aggregations'
    id = db.Column(db.Integer, primary_key=True)
    fpo_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    crop = db.Column(db.String(80), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default='AVAILABLE', nullable=False)

    def to_dict(self):
        return {'id': self.id, 'fpo_id': self.fpo_id, 'crop': self.crop, 'quantity': self.quantity, 'status': self.status}
