from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash
from flask_backend.app.services.auth_service import find_account_by_number, verify_pin, change_pin
from flask_backend.app.utils.jwt_utils import create_access_token, create_refresh_token, verify_token
from flask_backend.app import db
from flask_backend.app.models.user import User
from flask_backend.app.models.account import Account
from marshmallow import ValidationError
from flask_backend.app.schemas import LoginSchema, ChangePinSchema

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True) or {}
    try:
        payload = LoginSchema().load(data)
    except ValidationError as ve:
        return jsonify({'success': False, 'message': 'Validation error', 'details': ve.messages}), 400
    account_number = payload['account_number']
    pin = payload['pin']

    record = find_account_by_number(account_number)
    if not record:
        return jsonify({'success': False, 'message': 'Account not found'}), 401
    user, account = record
    if not verify_pin(account, pin):
        return jsonify({'success': False, 'message': 'Invalid PIN'}), 401

    token = create_access_token(current_app.config, user.id, role=user.role)
    refresh = create_refresh_token(current_app.config, user.id)
    return jsonify({
        'success': True,
        'token': token,
        'refresh_token': refresh,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
            'created_at': str(user.created_at)
        },
        'account': {
            'id': account.id,
            'user_id': account.user_id,
            'account_number': account.account_number,
            'balance': float(account.balance),
            'daily_limit': float(account.daily_limit),
            'daily_withdrawn': float(account.daily_withdrawn),
            'created_at': str(account.created_at)
        }
    })

@bp.route('/validate', methods=['GET'])
def validate():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if not payload or payload.get('type') != 'access':
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    user_id = int(payload.get('sub'))
    user = User.query.get(user_id)
    account = Account.query.filter_by(user_id=user_id).first()
    if not user or not account:
        return jsonify({'success': False, 'message': 'Session invalid'}), 401
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
            'id': account.id,
            'user_id': account.user_id,
            'account_number': account.account_number,
            'balance': float(account.balance),
            'daily_limit': float(account.daily_limit),
            'daily_withdrawn': float(account.daily_withdrawn),
            'created_at': str(account.created_at)
        }
    })

@bp.route('/logout', methods=['POST'])
def logout():
    # Revoke refresh token if provided
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if payload and payload.get('type') == 'refresh':
        revoked = current_app.config.setdefault('REVOKED_REFRESH_JTIS', set())
        revoked.add(payload.get('jti'))
    return jsonify({'success': True})

@bp.route('/refresh', methods=['POST'])
def refresh():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if not payload or payload.get('type') != 'refresh':
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    revoked = current_app.config.setdefault('REVOKED_REFRESH_JTIS', set())
    if payload.get('jti') in revoked:
        return jsonify({'success': False, 'message': 'Token revoked'}), 401
    user_id = int(payload.get('sub'))
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    new_access = create_access_token(current_app.config, user.id, role=user.role)
    new_refresh = create_refresh_token(current_app.config, user.id)
    return jsonify({'success': True, 'token': new_access, 'refresh_token': new_refresh})

@bp.route('/change-pin', methods=['POST'])
def change_pin_route():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if not payload or payload.get('type') != 'access':
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    user_id = int(payload.get('sub'))
    account = Account.query.filter_by(user_id=user_id).first()
    data = request.get_json(force=True) or {}
    try:
        payload = ChangePinSchema().load(data)
    except ValidationError as ve:
        return jsonify({'success': False, 'message': 'Validation error', 'details': ve.messages}), 400
    current_pin = payload['current_pin']
    new_pin = payload['new_pin']
    ok = change_pin(account, current_pin, new_pin)
    if not ok:
        return jsonify({'success': False, 'message': 'Current PIN incorrect'}), 401
    return jsonify({'success': True})
