from __future__ import annotations

from datetime import datetime, timezone
from functools import wraps
from typing import Optional

from flask import Flask, abort, jsonify, request
from sqlalchemy import Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import mapped_column, Mapped
from werkzeug.security import check_password_hash, generate_password_hash

from app.db import SessionLocal, engine
from app.models import Base  # re-use existing Base


class AdminUser(Base):
    """Admin user for backend dashboard authentication"""
    __tablename__ = "AdminUser"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(191), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="1", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


def init_admin_db(engine):
    """Create admin tables if they don't exist"""
    if engine is None:
        return
    AdminUser.__table__.create(bind=engine, checkfirst=True)


# token store (in-memory for simplicity - consider Redis for production)
_admin_tokens: set[str] = set()


def generate_token() -> str:
    import secrets
    token = secrets.token_urlsafe(32)
    _admin_tokens.add(token)
    return token


def revoke_token(token: str) -> None:
    _admin_tokens.discard(token)


def validate_token(token: str) -> bool:
    return token in _admin_tokens


def require_admin_auth(f):
    """Decorator to require admin authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token or not validate_token(token):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated
