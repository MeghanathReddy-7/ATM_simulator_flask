from datetime import date
from decimal import Decimal
from flask_backend.app import db
from flask_backend.app.models.account import Account
from flask_backend.app.models.transaction import Transaction
from flask_backend.app.models.receipt import Receipt

def _ensure_daily_window(account: Account):
    today = date.today()
    if account.last_withdrawal_date != today:
        account.daily_withdrawn = Decimal('0.00')
        account.last_withdrawal_date = today

def _build_receipt_number(tx: Transaction) -> str:
    return f"RCP{tx.created_at.strftime('%Y%m%d%H%M%S')}{tx.id}"

def withdraw(account: Account, amount: Decimal, description: str = 'ATM Withdrawal', daily_limit: Decimal = Decimal('25000.00')):
    if amount <= 0:
        raise ValueError('Invalid amount')

    # optimistic locking via version check
    _ensure_daily_window(account)

    if account.daily_withdrawn + amount > daily_limit:
        raise RuntimeError('Daily limit exceeded')
    if account.balance < amount:
        raise RuntimeError('Insufficient balance')

    prev_version = account.version
    account.balance = account.balance - amount
    account.daily_withdrawn = account.daily_withdrawn + amount
    account.version = account.version + 1
    db.session.add(account)
    db.session.flush()

    tx = Transaction(account_id=account.id, type='withdrawal', amount=amount, balance_after=account.balance, description=description)
    db.session.add(tx)
    db.session.flush()
    receipt = Receipt(transaction_id=tx.id, receipt_number=_build_receipt_number(tx), content='')
    db.session.add(receipt)

    # enforce optimistic lock
    updated = Account.query.filter_by(id=account.id, version=prev_version + 1).first() is not None
    if not updated:
        db.session.rollback()
        raise RuntimeError('Concurrent update detected')

    db.session.commit()
    return tx, receipt

def deposit(account: Account, amount: Decimal, description: str = 'ATM Deposit'):
    if amount <= 0:
        raise ValueError('Invalid amount')

    prev_version = account.version
    account.balance = account.balance + amount
    account.version = account.version + 1
    db.session.add(account)
    db.session.flush()

    tx = Transaction(account_id=account.id, type='deposit', amount=amount, balance_after=account.balance, description=description)
    db.session.add(tx)
    db.session.flush()
    receipt = Receipt(transaction_id=tx.id, receipt_number=_build_receipt_number(tx), content='')
    db.session.add(receipt)

    updated = Account.query.filter_by(id=account.id, version=prev_version + 1).first() is not None
    if not updated:
        db.session.rollback()
        raise RuntimeError('Concurrent update detected')

    db.session.commit()
    return tx, receipt

