from flask_backend.app import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())
