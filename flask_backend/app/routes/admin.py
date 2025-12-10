from flask import Blueprint, request, jsonify, current_app
from flask_backend.app.utils.jwt_utils import verify_token
from flask_backend.app.models.user import User
from flask_backend.app.models.account import Account
from flask_backend.app.models.transaction import Transaction
from flask_backend.app.models.receipt import Receipt

bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def _auth():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if not payload or payload.get('type') != 'access':
        return None
    return payload

@bp.route('/users', methods=['GET'])
def list_users():
    payload = _auth()
    if not payload:
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    if payload.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Forbidden'}), 403
    limit = int(request.args.get('limit', '20'))
    offset = int(request.args.get('offset', '0'))
    users = User.query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()
    return jsonify([
        {
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'phone': u.phone,
            'created_at': str(u.created_at)
        } for u in users
    ])

@bp.route('/accounts', methods=['GET'])
def list_accounts():
    payload = _auth()
    if not payload:
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    if payload.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Forbidden'}), 403
    limit = int(request.args.get('limit', '20'))
    offset = int(request.args.get('offset', '0'))
    accs = Account.query.order_by(Account.created_at.desc()).offset(offset).limit(limit).all()
    return jsonify([
        {
            'id': a.id,
            'user_id': a.user_id,
            'account_number': a.account_number,
            'balance': float(a.balance),
            'daily_limit': float(a.daily_limit),
            'daily_withdrawn': float(a.daily_withdrawn),
            'created_at': str(a.created_at)
        } for a in accs
    ])

@bp.route('/transactions', methods=['GET'])
def list_transactions():
    payload = _auth()
    if not payload:
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    if payload.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Forbidden'}), 403
    limit = int(request.args.get('limit', '20'))
    offset = int(request.args.get('offset', '0'))
    txs = Transaction.query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()
    return jsonify([
        {
            'id': t.id,
            'account_id': t.account_id,
            'type': t.type,
            'amount': float(t.amount),
            'balance_after': float(t.balance_after),
            'description': t.description,
            'created_at': str(t.created_at)
        } for t in txs
    ])

@bp.route('/receipts', methods=['GET'])
def list_receipts():
    payload = _auth()
    if not payload:
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    if payload.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Forbidden'}), 403
    limit = int(request.args.get('limit', '20'))
    offset = int(request.args.get('offset', '0'))
    recs = Receipt.query.order_by(Receipt.created_at.desc()).offset(offset).limit(limit).all()
    return jsonify([
        {
            'id': r.id,
            'transaction_id': r.transaction_id,
            'receipt_number': r.receipt_number,
            'created_at': str(r.created_at)
        } for r in recs
    ])
