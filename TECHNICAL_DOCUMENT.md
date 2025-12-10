# ATM Simulator – Technical Document

## Setup
- Backend: `flask_backend/` Python 3.11. Install with `pip install -r flask_backend/requirements.txt` then `python -m flask_backend.run`.
- Frontend: `npm install` then `npm run dev`. Set `VITE_API_URL=http://localhost:5000/api` in environment.

## Schema
- See SQLAlchemy models in `flask_backend/app/models/*` matching required tables: users, accounts, transactions, receipts.

## Architecture
- Flask API with JWT RS256 tokens, SQLAlchemy, optimistic locking via `accounts.version`.
- React + TS frontend with `AuthContext`, `api.ts` client, and ATM components for login, dashboard, withdraw, deposit, history, receipts.

## Security
- RS256 keys generated at runtime if not present in `flask_backend/keys/`.
- PINs hashed with Werkzeug PBKDF2.

## Validations & Errors
- Input validated server-side with numeric range checks, daily limit rules, and proper HTTP status codes (400, 401, 403, 404, 409, 500).

## Testing & CI/CD
- Backend tests under `flask_backend/tests/` with PyTest and coverage. GitLab CI configured in `.gitlab-ci.yml`. Dockerfile builds backend container.

