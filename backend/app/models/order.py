from .base import db

ORDER_STATUS_ALIASES = {
    'PENDING': 'ORDER_PLACED',
    'ORDER_PLACED': 'ORDER_PLACED',
    'PAYMENT_PENDING': 'PAYMENT_PENDING',
    'PAID': 'PAYMENT_CONFIRMED',
    'PAYMENT_CONFIRMED': 'PAYMENT_CONFIRMED',
    'CONFIRMED': 'SUPPLIER_CONFIRMED',
    'SUPPLIER_CONFIRMED': 'SUPPLIER_CONFIRMED',
    'PREPARING': 'PREPARING',
    'READY_FOR_PICKUP': 'READY_FOR_PICKUP',
    'LOGISTICS_REQUESTED': 'READY_FOR_PICKUP',
    'PICKED_UP': 'PICKED_UP',
    'IN_TRANSIT': 'IN_TRANSIT',
    'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED',
    'CANCELLED': 'CANCELLED',
    'REFUND_PENDING': 'REFUND_PENDING',
    'REFUNDED': 'REFUNDED',
    'FAILED': 'FAILED',
    'COMPLETED': 'DELIVERED',
}


def normalize_order_status(value):
    if value is None:
        return 'ORDER_PLACED'
    normalized = str(value).strip().upper()
    return ORDER_STATUS_ALIASES.get(normalized, normalized)


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(40), default='PENDING')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan', lazy=True)
    allocations = db.relationship('SupplierAllocation', backref='order', cascade='all, delete-orphan', lazy=True)
    status_history = db.relationship('OrderStatusHistory', backref='order', cascade='all, delete-orphan', lazy=True, order_by='OrderStatusHistory.id')

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'total_amount': self.total_amount,
            'status': normalize_order_status(self.status),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items': [item.to_dict() for item in self.items],
            'allocations': [allocation.to_dict() for allocation in self.allocations],
            'status_history': [entry.to_dict() for entry in self.status_history],
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    product = db.relationship('Product')

    def to_dict(self):
        return {'id': self.id, 'product_id': self.product_id, 'product_name': self.product.name, 'quantity': self.quantity, 'unit_price': self.unit_price, 'subtotal': round(self.quantity * self.unit_price, 2)}


class SupplierAllocation(db.Model):
    __tablename__ = 'supplier_allocations'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    allocated_quantity = db.Column(db.Float, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    fulfillment_status = db.Column(db.String(40), default='PENDING', nullable=False)
    pickup_status = db.Column(db.String(40), default='PENDING', nullable=False)
    settlement_status = db.Column(db.String(40), default='PENDING', nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    supplier = db.relationship('User', foreign_keys=[supplier_id])
    product = db.relationship('Product')

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'supplier_id': self.supplier_id,
            'product_id': self.product_id,
            'allocated_quantity': self.allocated_quantity,
            'unit_price': self.unit_price,
            'subtotal': self.subtotal,
            'fulfillment_status': normalize_order_status(self.fulfillment_status),
            'pickup_status': self.pickup_status,
            'settlement_status': self.settlement_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class OrderStatusHistory(db.Model):
    __tablename__ = 'order_status_history'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    status = db.Column(db.String(40), nullable=False)
    actor_type = db.Column(db.String(40), nullable=True)
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {'id': self.id, 'order_id': self.order_id, 'status': normalize_order_status(self.status), 'actor_type': self.actor_type, 'note': self.note, 'created_at': self.created_at.isoformat() if self.created_at else None}
