from flask import Blueprint, request, current_app, Response
from flask_backend.app.utils.jwt_utils import verify_token
from flask_backend.app.models.receipt import Receipt
from flask_backend.app.models.transaction import Transaction
from flask_backend.app.models.account import Account
from flask_backend.app.models.user import User
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime

bp = Blueprint('receipts_pdf', __name__, url_prefix='/api/receipts')

def _auth():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '')
    payload = verify_token(current_app.config, token)
    if not payload or payload.get('type') != 'access':
        return None
    return payload

@bp.route('/<int:receipt_id>/pdf', methods=['GET'])
def receipt_pdf(receipt_id: int):
    payload = _auth()
    if not payload:
        return Response('Unauthorized', status=401)

    rec = Receipt.query.get(receipt_id)
    if not rec:
        return Response('Not Found', status=404)

    tx = Transaction.query.get(rec.transaction_id)
    acc = Account.query.get(tx.account_id) if tx else None
    usr = User.query.get(acc.user_id) if acc else None
    if not tx or not acc or not usr:
        return Response('Not Found', status=404)

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "ATM SIMULATOR – Transaction Receipt")
    y -= 30
    c.setFont("Helvetica", 11)
    c.drawString(50, y, f"Receipt No: {rec.receipt_number}")
    y -= 18
    c.drawString(50, y, f"Date: {tx.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
    y -= 18
    masked = f"****{acc.account_number[-4:]}"
    c.drawString(50, y, f"Account: {masked}")
    y -= 18
    c.drawString(50, y, f"Name: {usr.name}")
    y -= 18
    c.drawString(50, y, f"Transaction: {tx.type.title()}")
    y -= 18
    c.drawString(50, y, f"Amount: ₹{float(tx.amount):,.2f}")
    y -= 18
    c.drawString(50, y, f"Balance After: ₹{float(tx.balance_after):,.2f}")
    y -= 30
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, y, "Thank you for banking with us. Please retain this receipt.")

    c.showPage()
    c.save()
    pdf = buf.getvalue()
    buf.close()

    return Response(pdf, mimetype='application/pdf', headers={
        'Content-Disposition': f'attachment; filename=receipt-{rec.receipt_number}.pdf'
    })

@bp.route('/latest/pdf', methods=['GET'])
def latest_receipt_pdf():
    payload = _auth()
    if not payload:
        return Response('Unauthorized', status=401)
    user_id = int(payload.get('sub'))
    acc = Account.query.filter_by(user_id=user_id).first()
    if not acc:
        return Response('Not Found', status=404)
    tx = Transaction.query.filter_by(account_id=acc.id).order_by(Transaction.created_at.desc()).first()
    if not tx:
        return Response('Not Found', status=404)
    rec = Receipt.query.filter_by(transaction_id=tx.id).first()
    if not rec:
        return Response('Not Found', status=404)
    # Reuse generation
    with current_app.test_request_context():
        return receipt_pdf(rec.id)
