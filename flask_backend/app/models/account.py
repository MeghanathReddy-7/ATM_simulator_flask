from flask_backend.app import db

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    account_number = db.Column(db.String(16), unique=True, nullable=False)
    pin_hash = db.Column(db.String(255), nullable=False)
    balance = db.Column(db.Numeric(15, 2), default=0.00)
    daily_limit = db.Column(db.Numeric(15, 2), default=25000.00)
    daily_withdrawn = db.Column(db.Numeric(15, 2), default=0.00)
    last_withdrawal_date = db.Column(db.Date)
    version = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())

