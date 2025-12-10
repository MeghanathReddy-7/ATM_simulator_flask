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
        a = Account(user_id=u.id, account_number='111122223333', pin_hash=generate_password_hash('1234'), balance=1000.0)
        db.session.add(a)
        db.session.commit()
    return app

def test_login_success():
    app = setup_app()
    client = app.test_client()
    resp = client.post('/api/auth/login', json={'account_number': '111122223333', 'pin': '1234'})
    data = resp.get_json()
    assert resp.status_code == 200
    assert data['success'] is True
    assert 'token' in data
