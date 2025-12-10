from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from flask_backend.app.models.user import User
from flask_backend.app.models.account import Account
from flask_backend.app.utils.validators import is_valid_email, is_valid_phone
from flask_backend.app import db
from marshmallow import ValidationError
from flask_backend.app.schemas import RegisterSchema

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(force=True) or {}
    try:
        payload = RegisterSchema().load(data)
    except ValidationError as ve:
        return jsonify({'success': False, 'message': 'Validation error', 'details': ve.messages}), 400
    name = payload['name']
    email = payload['email']
    phone = payload['phone']
    account_number = payload['account_number']
    pin = payload['pin']

    if not is_valid_email(email):
        return jsonify({'success': False, 'message': 'Invalid email'}), 400
    if not is_valid_phone(phone):
        return jsonify({'success': False, 'message': 'Invalid phone'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 409
    if Account.query.filter_by(account_number=account_number).first():
        return jsonify({'success': False, 'message': 'Account number already exists'}), 409

    user = User(name=name, email=email, phone=phone)
    db.session.add(user)
    db.session.flush()
    acc = Account(
        user_id=user.id,
        account_number=account_number,
        pin_hash=generate_password_hash(pin),
        balance=0.0
    )
    db.session.add(acc)
    db.session.commit()

    return jsonify({
        'success': True,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'created_at': str(user.created_at)
        },
        'account': {
            'id': acc.id,
            'user_id': acc.user_id,
            'account_number': acc.account_number,
            'balance': float(acc.balance),
            'daily_limit': float(acc.daily_limit),
            'daily_withdrawn': float(acc.daily_withdrawn),
            'created_at': str(acc.created_at)
        }
    }), 201
