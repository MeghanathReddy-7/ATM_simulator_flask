from flask_backend.app import db

class Receipt(db.Model):
    __tablename__ = 'receipts'
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transactions.id'), nullable=False)
    receipt_number = db.Column(db.String(50), unique=True, nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())

