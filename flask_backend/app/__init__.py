from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.exceptions import HTTPException
import logging
import uuid

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('flask_backend.app.config.Config')

    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        expose_headers=["Content-Type"],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    db.init_app(app)

    # Logging setup
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

    # Blueprints
    from flask_backend.app.routes import auth, transactions, account
    from flask_backend.app.routes import users
    from flask_backend.app.routes import admin
    from flask_backend.app.routes import receipts
    app.register_blueprint(auth.bp)
    app.register_blueprint(transactions.bp)
    app.register_blueprint(account.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(receipts.bp)

    @app.before_request
    def add_correlation_id():
        cid = request.headers.get('X-Correlation-ID') or str(uuid.uuid4())
        request.correlation_id = cid

    @app.errorhandler(Exception)
    def handle_exception(e):
        if isinstance(e, HTTPException):
            code = e.code
            message = e.description
        else:
            code = 500
            message = 'Internal server error'
        logging.error(f"error code={code} cid={getattr(request, 'correlation_id', '')} msg={str(e)}", exc_info=False)
        return jsonify({
            'success': False,
            'error': {
                'code': code,
                'message': message
            }
        }), code

    with app.app_context():
        db.create_all()

    return app
