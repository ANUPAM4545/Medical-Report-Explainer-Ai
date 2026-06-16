import base64
import hashlib
import hmac
import json
import secrets
import sqlite3
import time
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings
from app.models.schemas import UserCreate, UserLogin, UserPublic

security = HTTPBearer(auto_error=False)


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000)
    return f"pbkdf2_sha256${salt}${digest.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        _, salt, expected = stored.split("$", 2)
    except ValueError:
        return False
    candidate = _hash_password(password, salt).split("$", 2)[2]
    return hmac.compare_digest(candidate, expected)


class AuthService:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _init_db(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    plan TEXT NOT NULL DEFAULT 'premium',
                    created_at INTEGER NOT NULL
                )
                """
            )

    def register(self, payload: UserCreate) -> UserPublic:
        email = payload.email.strip().lower()
        with self._connect() as connection:
            existing = connection.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if existing:
                raise HTTPException(status_code=409, detail="An account with this email already exists.")
            user_id = uuid4().hex
            connection.execute(
                "INSERT INTO users (id, name, email, password_hash, plan, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, payload.name.strip(), email, _hash_password(payload.password), "premium", int(time.time())),
            )
        return UserPublic(id=user_id, name=payload.name.strip(), email=email, plan="premium")

    def register_google(self, name: str, email: str) -> UserPublic:
        email = email.strip().lower()
        with self._connect() as connection:
            existing = connection.execute("SELECT id, name, email, plan FROM users WHERE email = ?", (email,)).fetchone()
            if existing:
                return UserPublic(id=existing["id"], name=existing["name"], email=existing["email"], plan=existing["plan"])
            user_id = uuid4().hex
            # Generate a secure random password hash for Google users
            random_pw = secrets.token_hex(32)
            connection.execute(
                "INSERT INTO users (id, name, email, password_hash, plan, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, name.strip(), email, _hash_password(random_pw), "premium", int(time.time())),
            )
        return UserPublic(id=user_id, name=name.strip(), email=email, plan="premium")

    def authenticate(self, payload: UserLogin) -> UserPublic:
        with self._connect() as connection:
            row = connection.execute("SELECT * FROM users WHERE email = ?", (payload.email.strip().lower(),)).fetchone()
        if not row or not _verify_password(payload.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        return UserPublic(id=row["id"], name=row["name"], email=row["email"], plan=row["plan"])

    def get_user(self, user_id: str) -> UserPublic | None:
        with self._connect() as connection:
            row = connection.execute("SELECT id, name, email, plan FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            return None
        return UserPublic(id=row["id"], name=row["name"], email=row["email"], plan=row["plan"])

    def create_token(self, user: UserPublic, expires_in: int = 60 * 60 * 24 * 7) -> str:
        settings = get_settings()
        header = {"alg": "HS256", "typ": "JWT"}
        payload = {"sub": user.id, "email": user.email, "plan": user.plan, "exp": int(time.time()) + expires_in}
        signing_input = f"{_b64url(json.dumps(header).encode())}.{_b64url(json.dumps(payload).encode())}"
        signature = hmac.new(settings.auth_secret_key.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256).digest()
        return f"{signing_input}.{_b64url(signature)}"

    def verify_token(self, token: str) -> UserPublic:
        settings = get_settings()
        try:
            header_b64, payload_b64, signature_b64 = token.split(".", 2)
            signing_input = f"{header_b64}.{payload_b64}"
            expected = hmac.new(settings.auth_secret_key.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256).digest()
            if not hmac.compare_digest(_b64url(expected), signature_b64):
                raise ValueError("bad signature")
            payload = json.loads(_b64url_decode(payload_b64))
            if int(payload["exp"]) < int(time.time()):
                raise ValueError("expired")
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.") from exc

        user = self.get_user(str(payload["sub"]))
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists.")
        return user


_auth_service: AuthService | None = None


def get_auth_service() -> AuthService:
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService(get_settings().auth_db)
    return _auth_service


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> UserPublic:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication is required for premium access.")
    return get_auth_service().verify_token(credentials.credentials)
