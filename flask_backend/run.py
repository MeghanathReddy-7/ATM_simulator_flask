from flask_backend.app import create_app, db
from flask_backend.app.models.user import User
from flask_backend.app.models.account import Account
from werkzeug.security import generate_password_hash

def seed():
    if not User.query.first():
        user = User(name='John Doe', email='john@example.com', phone='9876543210')
        db.session.add(user)
        db.session.flush()
        acc = Account(user_id=user.id, account_number='1234567890', pin_hash=generate_password_hash('1234'), balance=50000.00, daily_limit=25000.00, daily_withdrawn=0.00)
        db.session.add(acc)
        admin = User(name='Admin', email='admin@example.com', phone='9999999999', role='admin')
        db.session.add(admin)
        db.session.flush()
        acc2 = Account(user_id=admin.id, account_number='5555555555', pin_hash=generate_password_hash('9999'), balance=100000.00, daily_limit=50000.00, daily_withdrawn=0.00)
        db.session.add(acc2)
        db.session.commit()

app = create_app()

with app.app_context():
    seed()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
