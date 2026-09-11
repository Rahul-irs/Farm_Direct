from .base import db


class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    provider = db.Column(db.String(40), default='development')
    status = db.Column(db.String(40), default='SUCCEEDED')
    transaction_reference = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {'id': self.id, 'order_id': self.order_id, 'customer_id': self.customer_id, 'amount': self.amount, 'provider': self.provider, 'status': self.status, 'transaction_reference': self.transaction_reference, 'created_at': self.created_at.isoformat() if self.created_at else None}