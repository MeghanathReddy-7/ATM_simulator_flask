import re

EMAIL_RE = re.compile(r'^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$')
PHONE_RE = re.compile(r'^[0-9]{10}$')
PAN_RE = re.compile(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
AADHAAR_RE = re.compile(r'^[0-9]{12}$')

def is_valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email))

def is_valid_phone(phone: str) -> bool:
    return bool(PHONE_RE.match(phone))

def is_valid_pan(pan: str) -> bool:
    return bool(PAN_RE.match(pan))

def is_valid_aadhaar(aadhaar: str) -> bool:
    return bool(AADHAAR_RE.match(aadhaar))

