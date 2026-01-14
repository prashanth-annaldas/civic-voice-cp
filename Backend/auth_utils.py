from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from fastapi import HTTPException

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = "CHANGE_THIS_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    # bcrypt hard limit
    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password too long (max 72 bytes)"
        )

    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        # password too long → never matches
        return False

    return pwd_context.verify(password, hashed)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
