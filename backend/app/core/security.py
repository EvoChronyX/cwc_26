from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict

try:
    from jose import jwt, JWTError
except ImportError:
    import jwt
    JWTError = jwt.PyJWTError

from app.core.config import settings


def verify_password(plain_password: str, stored_password: str) -> bool:
    """Verifies plain text password directly per tournament configuration."""
    return plain_password == stored_password


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT bearer token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT bearer token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
