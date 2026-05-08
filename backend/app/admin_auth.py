from __future__ import annotations

from datetime import datetime, timezone, timedelta
from functools import wraps
from typing import Optional
import secrets

from flask import Flask, abort, jsonify, request
from sqlalchemy import Integer, String, Boolean, DateTime, func, select, delete
from sqlalchemy.orm import mapped_column, Mapped
from werkzeug.security import check_password_hash, generate_password_hash

from app.db import SessionLocal, engine
from app.models import Base, Session as SessionModel, AdminUser


def init_admin_db(engine):
    """Create admin tables if they don't exist"""
    if engine is None:
        return
    AdminUser.__table__.create(bind=engine, checkfirst=True)
    SessionModel.__table__.create(bind=engine, checkfirst=True)


# ------------------------------------------------------------------
# Session Management (persistent, database-backed)
# ------------------------------------------------------------------

def _generate_session_id() -> str:
    """Generate a cryptographically secure session ID."""
    return secrets.token_urlsafe(64)


def _create_session(admin_id: int, days: int = 7) -> str:
    """
    Create a persistent session record in the database.
    Returns the session ID.
    """
    session_id = _generate_session_id()
    expires_at = datetime.now(tz=timezone.utc) + timedelta(days=days)

    db_session = SessionLocal()
    try:
        session = SessionModel(
            id=session_id,
            adminId=admin_id,
            expiresAt=expires_at,
        )
        db_session.add(session)
        db_session.commit()
    finally:
        db_session.close()
    return session_id


def _revoke_session(session_id: str) -> None:
    """Revoke a session by deleting it from the database."""
    db_session = SessionLocal()
    try:
        db_session.execute(
            delete(SessionModel).where(SessionModel.id == session_id)
        )
        db_session.commit()
    finally:
        db_session.close()


def _revoke_all_admin_sessions(admin_id: int) -> None:
    """Revoke all sessions for an admin user."""
    db_session = SessionLocal()
    try:
        db_session.execute(
            delete(SessionModel).where(SessionModel.adminId == admin_id)
        )
        db_session.commit()
    finally:
        db_session.close()


def _validate_session(session_id: str) -> Optional[AdminUser]:
    """
    Validate a session ID and return the associated admin user if valid.
    Deletes expired sessions.
    """
    db_session = SessionLocal()
    try:
        now = datetime.now(tz=timezone.utc)

        # Delete expired sessions first
        db_session.execute(
            delete(SessionModel).where(SessionModel.expiresAt < now)
        )
        db_session.commit()

        # Check if the session is valid
        result = db_session.execute(
            select(AdminUser)
            .join(SessionModel, SessionModel.adminId == AdminUser.id)
            .where(
                SessionModel.id == session_id,
                SessionModel.expiresAt >= now,
                AdminUser.is_active == True,
            )
        ).scalar_one_or_none()
        return result
    finally:
        db_session.close()


# ------------------------------------------------------------------
# Auth Decorator
# ------------------------------------------------------------------

def require_admin_auth(f):
    """Decorator to require admin authentication via session cookie."""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Try to get session ID from httpOnly cookie first
        cookie_header = request.headers.get("Cookie", "")
        cookie_match = cookie_header.match(r"admin_session=([^;]+)")
        session_id = cookie_match.group(1) if cookie_match else None

        # Fallback to Authorization Bearer header (for API clients)
        if not session_id:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                session_id = auth_header[7:]

        if not session_id:
            return jsonify({"error": "Unauthorized", "message": "No session found"}), 401

        admin_user = _validate_session(session_id)
        if not admin_user:
            return jsonify({"error": "Unauthorized", "message": "Invalid or expired session"}), 401

        # Attach admin user to request for use in routes
        request.admin_user = admin_user
        return f(*args, **kwargs)
    return decorated

