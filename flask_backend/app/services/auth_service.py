from werkzeug.security import check_password_hash, generate_password_hash
from flask_backend.app.models.user import User
from flask_backend.app.models.account import Account
from flask_backend.app import db
from typing import Optional, Tuple

def find_account_by_number(account_number: str) -> Optional[Tuple[User, Account]]:
    account = Account.query.filter_by(account_number=account_number).first()
    if not account:
        return None
    user = User.query.get(account.user_id)
    return (user, account)

def verify_pin(account: Account, pin: str) -> bool:
    return check_password_hash(account.pin_hash, pin)

def change_pin(account: Account, current_pin: str, new_pin: str) -> bool:
    if not verify_pin(account, current_pin):
        return False
    account.pin_hash = generate_password_hash(new_pin)
    db.session.add(account)
    db.session.commit()
    return True

