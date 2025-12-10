import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///atm.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    DAILY_WITHDRAW_LIMIT = float(os.getenv('DAILY_WITHDRAW_LIMIT', '25000'))
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:8081,http://localhost:5173').split(',')
    JWT_PRIVATE_KEY_PATH = os.getenv('JWT_PRIVATE_KEY_PATH', 'flask_backend/keys/jwtRS256.key')
    JWT_PUBLIC_KEY_PATH = os.getenv('JWT_PUBLIC_KEY_PATH', 'flask_backend/keys/jwtRS256.key.pub')
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '15'))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRE_DAYS', '7'))
