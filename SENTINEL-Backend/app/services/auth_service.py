from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import HTTPException
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.config import settings
from app.db import queries
import bcrypt

# _pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Safely check the plain password against the database hash
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def hash_password(password: str) -> str:
    # Encode the password to bytes, hash it with a salt, and decode back to a string for the database
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_bytes.decode('utf-8')

def _make_token(data: dict, expires_delta: timedelta) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str, workspace_id: str) -> str:
    return _make_token(
        {"sub": user_id, "workspace_id": workspace_id, "type": "access"},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: str, workspace_id: str) -> str:
    return _make_token(
        {"sub": user_id, "workspace_id": workspace_id, "type": "refresh"},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def authenticate_user(email: str, password: str) -> dict:
    user = queries.fetch_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    stored_hash = user.get("password_hash", "")
    if not stored_hash or not verify_password(password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user


def get_current_user(token: str) -> dict:
    payload = verify_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    return payload
