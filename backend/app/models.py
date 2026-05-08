from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.mysql import DECIMAL, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Category(Base):
    __tablename__ = "Category"

    id: Mapped[str] = mapped_column(String(191), primary_key=True)
    name: Mapped[str] = mapped_column(String(191))
    slug: Mapped[str] = mapped_column(String(191), unique=True, index=True)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    updatedAt: Mapped[str] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Sermon(Base):
    __tablename__ = "Sermon"

    id: Mapped[str] = mapped_column(String(191), primary_key=True)
    slug: Mapped[str] = mapped_column(String(191), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(191))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    speaker: Mapped[str | None] = mapped_column(String(191), nullable=True)
    date: Mapped[str] = mapped_column(DateTime)
    durationMinutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    thumbnailUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    videoUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    categoryId: Mapped[str | None] = mapped_column(String(191), nullable=True, index=True)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    updatedAt: Mapped[str] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Message(Base):
    __tablename__ = "Message"

    id: Mapped[str] = mapped_column(String(191), primary_key=True)
    name: Mapped[str] = mapped_column(String(191))
    email: Mapped[str] = mapped_column(String(191))
    phone: Mapped[str | None] = mapped_column(String(191), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(191), nullable=True)
    message: Mapped[str] = mapped_column(Text)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())


class Event(Base):
    __tablename__ = "Event"

    id: Mapped[str] = mapped_column(String(191), primary_key=True)
    slug: Mapped[str] = mapped_column(String(191), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(191))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(191), nullable=True)
    posterUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    startAt: Mapped[str] = mapped_column(DateTime, index=True)
    endAt: Mapped[str | None] = mapped_column(DateTime, nullable=True)
    isPublished: Mapped[bool] = mapped_column(Boolean, server_default="1", index=True)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    updatedAt: Mapped[str] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Pastor(Base):
    __tablename__ = "Pastor"

    id: Mapped[str] = mapped_column(String(191), primary_key=True)
    slug: Mapped[str] = mapped_column(String(191), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(191), index=True)
    roleTitle: Mapped[str | None] = mapped_column(String(191), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    photoUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sortOrder: Mapped[int] = mapped_column(Integer, server_default="0", index=True)
    isPublished: Mapped[bool] = mapped_column(Boolean, server_default="1", index=True)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    updatedAt: Mapped[str] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Ministry(Base):
    __tablename__ = "Ministry"

    id: Mapped[str] = mapped_column(String(191), primary_key=True)
    slug: Mapped[str] = mapped_column(String(191), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(191), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    highlights: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    imageUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sortOrder: Mapped[int] = mapped_column(Integer, server_default="0", index=True)
    isPublished: Mapped[bool] = mapped_column(Boolean, server_default="1", index=True)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    updatedAt: Mapped[str] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class SiteSettings(Base):
    __tablename__ = "SiteSettings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    siteName: Mapped[str] = mapped_column(String(191))
    shortName: Mapped[str] = mapped_column(String(191))
    tagline: Mapped[str] = mapped_column(String(191))
    location: Mapped[str] = mapped_column(String(191))
    logoUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    addressLine1: Mapped[str | None] = mapped_column(String(191), nullable=True)
    addressLine2: Mapped[str | None] = mapped_column(String(191), nullable=True)
    phoneDisplay: Mapped[str | None] = mapped_column(String(191), nullable=True)
    phoneTel: Mapped[str | None] = mapped_column(String(191), nullable=True)
    email: Mapped[str | None] = mapped_column(String(191), nullable=True)
    youtubeUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    facebookUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    instagramUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tiktokUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    linktreeUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    liveEmbedUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    serviceTimes: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    school: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    giving: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    updatedAt: Mapped[str] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Donation(Base):
    __tablename__ = "Donation"

    id: Mapped[str] = mapped_column(String(191), primary_key=True)
    name: Mapped[str] = mapped_column(String(191))
    email: Mapped[str | None] = mapped_column(String(191), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(191), nullable=True)
    amount: Mapped[str] = mapped_column(DECIMAL(10, 2))
    currency: Mapped[str] = mapped_column(String(10), server_default="KES")
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())


class GalleryItem(Base):
    __tablename__ = "GalleryItem"

    id: Mapped[str] = mapped_column(String(191), primary_key=True)
    imageUrl: Mapped[str | None] = mapped_column(String(500), nullable=True)
    caption: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sortOrder: Mapped[int] = mapped_column(Integer, server_default="0", index=True)
    isPublished: Mapped[bool] = mapped_column(Boolean, server_default="1", index=True)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())
    updatedAt: Mapped[str] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class AdminUser(Base):
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


class Session(Base):
    __tablename__ = "Session"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    adminId: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    expiresAt: Mapped[str] = mapped_column(DateTime, nullable=False)
    createdAt: Mapped[str] = mapped_column(DateTime, server_default=func.now())
