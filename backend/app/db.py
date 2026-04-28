from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings


def _build_engine():
    url = settings.sqlalchemy_database_url
    if not url:
        return None
    return create_engine(url, pool_pre_ping=True, future=True)


engine = _build_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    if engine is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

