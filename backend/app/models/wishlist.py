from .base import db


class WishlistItem(db.Model):
    __tablename__ = 'wishlist_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product = db.relationship('Product')
    __table_args__ = (db.UniqueConstraint('user_id', 'product_id', name='uq_wishlist_user_product'),)

    def to_dict(self):
        return {'id': self.id, 'product_id': self.product_id, 'product': self.product.to_dict()}
