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
        u = User(name='Test', email='t@example.com', phone='9999999999')
        db.session.add(u)
        db.session.flush()
        a = Account(user_id=u.id, account_number='111122223333', pin_hash=generate_password_hash('1234'), balance=10000.0, daily_limit=5000.0)
        db.session.add(a)
        db.session.commit()
    return app

def auth_headers(client):
    resp = client.post('/api/auth/login', json={'account_number': '111122223333', 'pin': '1234'})
    token = resp.get_json()['token']
    return {'Authorization': f'Bearer {token}'}

def test_withdraw_limit():
    app = setup_app()
    client = app.test_client()
    headers = auth_headers(client)
    r = client.post('/api/transactions/withdraw', json={'amount': 6000}, headers=headers)
    assert r.status_code in (403, 400)

def test_deposit_and_history():
    app = setup_app()
    client = app.test_client()
    headers = auth_headers(client)
    r = client.post('/api/transactions/deposit', json={'amount': 1234.56}, headers=headers)
    assert r.status_code == 200
    h = client.get('/api/transactions/history?limit=5', headers=headers)
    assert h.status_code == 200
    assert isinstance(h.get_json(), list)
