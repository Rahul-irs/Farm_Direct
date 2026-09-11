from .base import db


class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    product = db.relationship('Product')

    __table_args__ = (db.UniqueConstraint('product_id', 'customer_id', 'order_id', name='uq_review_purchase'),)

    def to_dict(self):
        return {'id': self.id, 'product_id': self.product_id, 'customer_id': self.customer_id, 'order_id': self.order_id, 'rating': self.rating, 'comment': self.comment, 'created_at': self.created_at.isoformat() if self.created_at else None}
