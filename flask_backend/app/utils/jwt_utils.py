import os
import time
import uuid
from typing import Optional, Dict
import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

def _ensure_keys(private_path: str, public_path: str):
    if os.path.exists(private_path) and os.path.exists(public_path):
        return
    os.makedirs(os.path.dirname(private_path), exist_ok=True)
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048, backend=default_backend())
    private_bytes = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    public_bytes = key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    with open(private_path, 'wb') as f:
        f.write(private_bytes)
    with open(public_path, 'wb') as f:
        f.write(public_bytes)

def _load_keys(private_path: str, public_path: str):
    _ensure_keys(private_path, public_path)
    with open(private_path, 'rb') as f:
        priv = f.read()
    with open(public_path, 'rb') as f:
        pub = f.read()
    return priv, pub

def _cfg(config, key, default=None):
    try:
        return config[key]
    except Exception:
        return getattr(config, key, default)

def create_access_token(config, user_id: int, role: str = 'user') -> str:
    private_key, _ = _load_keys(_cfg(config, 'JWT_PRIVATE_KEY_PATH'), _cfg(config, 'JWT_PUBLIC_KEY_PATH'))
    payload = {
        'sub': str(user_id),
        'role': role,
        'type': 'access',
        'iat': int(time.time()),
        'exp': int(time.time()) + int(_cfg(config, 'JWT_ACCESS_TOKEN_EXPIRE_MINUTES', 15)) * 60,
        'jti': str(uuid.uuid4())
    }
    return jwt.encode(payload, private_key, algorithm='RS256')

def create_refresh_token(config, user_id: int) -> str:
    private_key, _ = _load_keys(_cfg(config, 'JWT_PRIVATE_KEY_PATH'), _cfg(config, 'JWT_PUBLIC_KEY_PATH'))
    payload = {
        'sub': str(user_id),
        'type': 'refresh',
        'iat': int(time.time()),
        'exp': int(time.time()) + int(_cfg(config, 'JWT_REFRESH_TOKEN_EXPIRE_DAYS', 7)) * 24 * 3600,
        'jti': str(uuid.uuid4())
    }
    return jwt.encode(payload, private_key, algorithm='RS256')

def verify_token(config, token: str) -> Optional[Dict]:
    _, public_key = _load_keys(_cfg(config, 'JWT_PRIVATE_KEY_PATH'), _cfg(config, 'JWT_PUBLIC_KEY_PATH'))
    try:
        payload = jwt.decode(token, public_key, algorithms=['RS256'])
        return payload
    except Exception:
        return None
