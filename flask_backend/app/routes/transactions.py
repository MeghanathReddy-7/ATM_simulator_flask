from flask import Blueprint, request, jsonify, current_app
from decimal import Decimal
from flask_backend.app.utils.jwt_utils import verify_token
from flask_backend.app.models.account import Account
from flask_backend.app.services.transaction_service import withdraw as do_withdraw, deposit as do_deposit
from flask_backend.app.models.transaction import Transaction
from marshmallow import ValidationError
from flask_backend.app.schemas import AmountSchema

bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@bp.route('/withdraw', methods=['POST'])
def withdraw():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if not payload or payload.get('type') != 'access':
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    user_id = int(payload.get('sub'))
    account = Account.query.filter_by(user_id=user_id).first()
    data = request.get_json(force=True) or {}
    try:
        payload = AmountSchema().load(data)
    except ValidationError as ve:
        return jsonify({'success': False, 'message': 'Validation error', 'details': ve.messages}), 400
    amount = Decimal(str(payload['amount']))
    try:
        tx, receipt = do_withdraw(account, amount, daily_limit=Decimal(str(account.daily_limit)))
        return jsonify({
            'success': True,
            'transaction': {
                'id': tx.id,
                'account_id': tx.account_id,
                'type': tx.type,
                'amount': float(tx.amount),
                'balance_after': float(tx.balance_after),
                'description': tx.description,
                'created_at': str(tx.created_at)
            },
            'receipt': {
                'id': receipt.id,
                'transaction_id': receipt.transaction_id,
                'receipt_number': receipt.receipt_number,
                'content': receipt.content,
                'created_at': str(receipt.created_at)
            },
            'new_balance': float(tx.balance_after)
        })
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except RuntimeError as re:
        msg = str(re)
        code = 409 if 'Concurrent' in msg else 403 if 'Daily limit' in msg else 400
        return jsonify({'success': False, 'message': msg}), code

@bp.route('/deposit', methods=['POST'])
def deposit():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if not payload or payload.get('type') != 'access':
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    user_id = int(payload.get('sub'))
    account = Account.query.filter_by(user_id=user_id).first()
    data = request.get_json(force=True) or {}
    try:
        payload = AmountSchema().load(data)
    except ValidationError as ve:
        return jsonify({'success': False, 'message': 'Validation error', 'details': ve.messages}), 400
    amount = Decimal(str(payload['amount']))
    try:
        tx, receipt = do_deposit(account, amount)
        return jsonify({
            'success': True,
            'transaction': {
                'id': tx.id,
                'account_id': tx.account_id,
                'type': tx.type,
                'amount': float(tx.amount),
                'balance_after': float(tx.balance_after),
                'description': tx.description,
                'created_at': str(tx.created_at)
            },
            'receipt': {
                'id': receipt.id,
                'transaction_id': receipt.transaction_id,
                'receipt_number': receipt.receipt_number,
                'content': receipt.content,
                'created_at': str(receipt.created_at)
            },
            'new_balance': float(tx.balance_after)
        })
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400

@bp.route('/history', methods=['GET'])
def history():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if not payload or payload.get('type') != 'access':
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    user_id = int(payload.get('sub'))
    account = Account.query.filter_by(user_id=user_id).first()
    limit = int(request.args.get('limit', '10'))
    txs = Transaction.query.filter_by(account_id=account.id).order_by(Transaction.created_at.desc()).limit(limit).all()
    return jsonify([
        {
            'id': t.id,
            'account_id': t.account_id,
            'type': t.type,
            'amount': float(t.amount),
            'balance_after': float(t.balance_after),
            'description': t.description,
            'created_at': str(t.created_at)
        }
        for t in txs
    ])
