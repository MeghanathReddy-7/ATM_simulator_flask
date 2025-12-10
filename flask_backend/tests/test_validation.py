from flask_backend.app import create_app, db
from flask_backend.app.models.user import User
from flask_backend.app.models.account import Account
from werkzeug.security import generate_password_hash

def setup_app():
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.drop_all()
        db.create_all()
        u = User(name='Val', email='val@example.com', phone='9999999999')
        db.session.add(u)
        db.session.flush()
        a = Account(user_id=u.id, account_number='2222222222', pin_hash=generate_password_hash('1234'), balance=10000.0, daily_limit=5000.0)
        db.session.add(a)
        db.session.commit()
    return app

def auth_headers(client):
    r = client.post('/api/auth/login', json={'account_number': '2222222222', 'pin': '1234'})
    token = r.get_json()['token']
    return {'Authorization': f'Bearer {token}'}

def test_register_validation():
    app = setup_app()
    client = app.test_client()
    r = client.post('/api/users/register', json={'name': '', 'email': 'bad', 'phone': '123', 'account_number': 'x', 'pin': 'y'})
    assert r.status_code == 400

def test_login_validation():
    app = setup_app()
    client = app.test_client()
    r = client.post('/api/auth/login', json={'account_number': 'x', 'pin': '12'})
    assert r.status_code == 400

def test_amount_validation():
    app = setup_app()
    client = app.test_client()
    headers = auth_headers(client)
    r = client.post('/api/transactions/withdraw', json={'amount': -1}, headers=headers)
    assert r.status_code == 400
    r2 = client.post('/api/transactions/deposit', json={'amount': 0}, headers=headers)
    assert r2.status_code == 400

