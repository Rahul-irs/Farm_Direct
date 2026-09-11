from .base import db


class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    items = db.relationship('CartItem', backref='cart', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'customer_id': self.customer_id, 'items': [item.to_dict() for item in self.items]}


class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    product = db.relationship('Product')

    __table_args__ = (db.UniqueConstraint('cart_id', 'product_id', name='uq_cart_product'),)

    def to_dict(self):
        return {'id': self.id, 'product_id': self.product_id, 'quantity': self.quantity, 'product': self.product.to_dict(), 'subtotal': round(self.quantity * self.product.price, 2)}