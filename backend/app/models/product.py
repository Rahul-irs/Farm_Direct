from .base import db


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    crop = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=True)
    quantity = db.Column(db.Float, default=0.0)
    unit = db.Column(db.String(20), default='kg')
    price = db.Column(db.Float, default=0.0)
    quality = db.Column(db.String(50), default='Grade A')
    location = db.Column(db.String(120), nullable=False)
    farmer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'crop': self.crop,
            'description': self.description,
            'quantity': self.quantity,
            'unit': self.unit,
            'price': self.price,
            'quality': self.quality,
            'location': self.location,
            'farmer_id': self.farmer_id,
            'image_url': self.image_url,
            'is_active': self.is_active,
        }
