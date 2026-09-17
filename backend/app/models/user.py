from .base import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(30), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(40), default='consumer', nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    farm_profile = db.Column(db.JSON, nullable=True, default=dict)
    profile_data = db.Column(db.JSON, nullable=True, default=dict)

    def to_dict(self):
        profile_data = self.profile_data or {}
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'farm_profile': self.farm_profile or {},
            'profile_data': profile_data,
            'address': profile_data.get('address'),
            'village': profile_data.get('village'),
            'mandal': profile_data.get('mandal'),
            'district': profile_data.get('district'),
            'state': profile_data.get('state'),
            'language': profile_data.get('language'),
            'bank_details': profile_data.get('bank_details'),
        }
