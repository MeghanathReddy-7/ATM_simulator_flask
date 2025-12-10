from flask import Blueprint, request, jsonify, current_app
from flask_backend.app.utils.jwt_utils import verify_token
from flask_backend.app.models.account import Account

bp = Blueprint('account', __name__, url_prefix='/api/account')

@bp.route('/balance', methods=['GET'])
def balance():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if not payload or payload.get('type') != 'access':
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    user_id = int(payload.get('sub'))
    account = Account.query.filter_by(user_id=user_id).first()
    return jsonify({
        'balance': float(account.balance),
        'daily_limit': float(account.daily_limit),
        'daily_withdrawn': float(account.daily_withdrawn)
    })

