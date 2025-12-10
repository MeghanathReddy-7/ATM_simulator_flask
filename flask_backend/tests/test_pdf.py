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
        u = User(name='PDF', email='pdf@example.com', phone='9999999999')
        db.session.add(u)
        db.session.flush()
        a = Account(user_id=u.id, account_number='3333333333', pin_hash=generate_password_hash('1234'), balance=10000.0, daily_limit=5000.0)
        db.session.add(a)
        db.session.commit()
    return app

def auth_headers(client):
    r = client.post('/api/auth/login', json={'account_number': '3333333333', 'pin': '1234'})
    token = r.get_json()['token']
    return {'Authorization': f'Bearer {token}'}

def test_receipt_pdf_download():
    app = setup_app()
    client = app.test_client()
    headers = auth_headers(client)
    dep = client.post('/api/transactions/deposit', json={'amount': 500}, headers=headers).get_json()
    rid = dep['receipt']['id']
    pdf_resp = client.get(f'/api/receipts/{rid}/pdf', headers=headers)
    assert pdf_resp.status_code == 200
    assert pdf_resp.content_type == 'application/pdf'
