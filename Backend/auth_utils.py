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


def _safe_password(password: str) -> str:
    # bcrypt works on BYTES, not chars
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        # hard fail BEFORE bcrypt
        raise HTTPException(
            status_code=400,
            detail="Password too long (max 72 bytes)"
        )

    return password


def hash_password(password: str) -> str:
    password = _safe_password(password)
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        password_bytes = password.encode("utf-8")

        if len(password_bytes) > 72:
            return False

        return pwd_context.verify(password, hashed)

    except Exception as e:
        # NEVER let bcrypt crash the server
        print("BCRYPT VERIFY ERROR:", e)
        return False


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
