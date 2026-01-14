from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = "CHANGE_THIS_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def _bcrypt_safe(password: str) -> str:
    # bcrypt limit = 72 BYTES
    return password.encode("utf-8")[:72].decode("utf-8", errors="ignore")


def hash_password(password: str) -> str:
    password = _bcrypt_safe(password)
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        password = _bcrypt_safe(password)
        return pwd_context.verify(password, hashed)
    except Exception as e:
        print("BCRYPT ERROR:", e)
        return False


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
