# Flask Backend Setup for ATM Simulator

This React frontend is designed to connect to a Flask backend. Follow this guide to set up your Flask API.

## Required API Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user with account number and PIN.

**Request:**
```json
{
  "account_number": "1234567890",
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "account": {
    "id": 1,
    "user_id": 1,
    "account_number": "1234567890",
    "balance": 50000.00,
    "daily_limit": 25000.00,
    "daily_withdrawn": 0.00,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/auth/logout
Invalidate user session.

#### GET /api/auth/validate
Validate JWT token and return user/account data.

#### POST /api/auth/change-pin
Change user PIN.

**Request:**
```json
{
  "current_pin": "1234",
  "new_pin": "5678"
}
```

### Transactions

#### POST /api/transactions/withdraw
Process withdrawal.

**Request:**
```json
{
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": 1,
    "account_id": 1,
    "type": "withdrawal",
    "amount": 5000.00,
    "balance_after": 45000.00,
    "description": "ATM Withdrawal",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "receipt": {
    "id": 1,
    "transaction_id": 1,
    "receipt_number": "RCP20240101100000",
    "content": "...",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "new_balance": 45000.00
}
```

#### POST /api/transactions/deposit
Process deposit.

#### GET /api/transactions/history?limit=10
Get transaction history.

### Account

#### GET /api/account/balance
Get current balance and limits.

**Response:**
```json
{
  "balance": 50000.00,
  "daily_limit": 25000.00,
  "daily_withdrawn": 5000.00
}
```

## Database Schema (SQL)

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_number VARCHAR(16) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    daily_limit DECIMAL(15, 2) DEFAULT 25000.00,
    daily_withdrawn DECIMAL(15, 2) DEFAULT 0.00,
    last_withdrawal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transactions table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('withdrawal', 'deposit', 'transfer')),
    amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Receipts table
CREATE TABLE receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Index for performance
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_accounts_number ON accounts(account_number);
```

## Flask Application Structure

```
flask_backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── account.py
│   │   └── transaction.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── transactions.py
│   │   └── account.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   └── transaction_service.py
│   └── utils/
│       ├── __init__.py
│       ├── jwt_utils.py
│       └── validators.py
├── migrations/
├── tests/
├── requirements.txt
├── run.py
└── Dockerfile
```

## Sample Flask Code

```python
# app/__init__.py
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///atm.db'
    app.config['SECRET_KEY'] = 'your-secret-key'
    
    CORS(app, origins=['http://localhost:5173'])
    db.init_app(app)
    
    from app.routes import auth, transactions, account
    app.register_blueprint(auth.bp)
    app.register_blueprint(transactions.bp)
    app.register_blueprint(account.bp)
    
    return app

# app/routes/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
import jwt

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # Validate and authenticate
    # Return JWT token
    pass
```

## Environment Variables

Create a `.env` file in your React project:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running Both Applications

1. **Start Flask Backend:**
   ```bash
   cd flask_backend
   pip install -r requirements.txt
   python run.py
   ```

2. **Start React Frontend:**
   ```bash
   npm run dev
   ```

## Testing

The frontend expects these error codes for proper error handling:
- 400: Validation errors
- 401: Authentication failed
- 403: Access denied
- 404: Resource not found
- 409: Conflict (e.g., concurrent transaction)
- 500: Server error
