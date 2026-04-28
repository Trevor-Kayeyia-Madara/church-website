from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from flask import Flask, abort, jsonify, request
from flask import send_from_directory
from flask_cors import CORS
from sqlalchemy import asc, desc, select

from app.config import settings
from app.db import SessionLocal, engine
from app.defaults import DEFAULT_SITE, MOCK_CATEGORIES, MOCK_SERMONS
from app.models import Category, Event, Message, Ministry, Pastor, Sermon, SiteSettings
from app.youtube import YouTubeVideo, get_youtube_videos, has_youtube_source


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": settings.cors_allow_origins or "*"}})
    api_prefix = (settings.api_prefix or "").strip()
    if api_prefix and not api_prefix.startswith("/"):
        api_prefix = "/" + api_prefix
    if api_prefix.endswith("/"):
        api_prefix = api_prefix[:-1]

    dist_dir = Path(settings.frontend_dist_dir).expanduser() if settings.frontend_dist_dir else None
    if dist_dir and not dist_dir.is_absolute():
        dist_dir = (Path(__file__).resolve().parent.parent / dist_dir).resolve()

    def has_dist() -> bool:
        return bool(dist_dir and dist_dir.exists() and (dist_dir / "index.html").exists())

    def serve_spa(path: str = ""):
        if not has_dist():
            abort(404)
        # If file exists in dist, serve it. Otherwise serve index.html for SPA routing.
        target = (dist_dir / path) if path else None  # type: ignore[operator]
        if target and target.exists() and target.is_file():
            return send_from_directory(dist_dir, path)  # type: ignore[arg-type]
        return send_from_directory(dist_dir, "index.html")  # type: ignore[arg-type]

    if has_dist():
        @app.get(f"{api_prefix}/" if api_prefix else "/")
        def _spa_root():
            return serve_spa("")

        @app.get(f"{api_prefix}/<path:path>" if api_prefix else "/<path:path>")
        def _spa_catchall(path: str):
            if path.startswith("api/") or path == "api" or path == "health":
                abort(404)
            return serve_spa(path)

    @app.get(f"{api_prefix}/health")
    def health():
        return jsonify({"ok": True})

    @app.get(f"{api_prefix}/api/site")
    def get_site():
        if engine is None:
            return jsonify({"ok": True, "site": DEFAULT_SITE, "mocked": True})
        with SessionLocal() as db:
            try:
                row = (
                    db.execute(select(SiteSettings).order_by(asc(SiteSettings.id)).limit(1))
                    .scalar_one_or_none()
                )
                if not row:
                    return jsonify({"ok": True, "site": DEFAULT_SITE, "mocked": True})

                site = {
                    **DEFAULT_SITE,
                    "name": row.siteName or DEFAULT_SITE["name"],
                    "shortName": row.shortName or DEFAULT_SITE["shortName"],
                    "tagline": row.tagline or DEFAULT_SITE["tagline"],
                    "location": row.location or DEFAULT_SITE["location"],
                    "logoUrl": row.logoUrl or DEFAULT_SITE["logoUrl"],
                    "liveEmbedUrl": row.liveEmbedUrl or DEFAULT_SITE.get("liveEmbedUrl"),
                    "serviceTimes": row.serviceTimes or DEFAULT_SITE.get("serviceTimes"),
                    "school": row.school or DEFAULT_SITE.get("school"),
                    "giving": row.giving or DEFAULT_SITE.get("giving"),
                    "contact": {
                        **DEFAULT_SITE["contact"],
                        "addressLine1": row.addressLine1 or DEFAULT_SITE["contact"]["addressLine1"],
                        "addressLine2": row.addressLine2 or DEFAULT_SITE["contact"]["addressLine2"],
                        "phoneDisplay": row.phoneDisplay or DEFAULT_SITE["contact"]["phoneDisplay"],
                        "phoneTel": row.phoneTel or DEFAULT_SITE["contact"]["phoneTel"],
                        "email": row.email or DEFAULT_SITE["contact"]["email"],
                    },
                    "social": {
                        **DEFAULT_SITE["social"],
                        "youtube": row.youtubeUrl or DEFAULT_SITE["social"]["youtube"],
                        "facebook": row.facebookUrl or DEFAULT_SITE["social"]["facebook"],
                        "instagram": row.instagramUrl or DEFAULT_SITE["social"]["instagram"],
                        "tiktok": row.tiktokUrl or DEFAULT_SITE["social"]["tiktok"],
                        "linktree": row.linktreeUrl or DEFAULT_SITE["social"]["linktree"],
                    },
                }
                return jsonify({"ok": True, "site": site})
            except Exception as e:  # noqa: BLE001
                return jsonify({"ok": True, "site": DEFAULT_SITE, "mocked": True, "error": str(e)})

    @app.get(f"{api_prefix}/api/events")
    def list_events():
        limit = min(max(int(request.args.get("limit", "3") or "3"), 1), 50)
        upcoming = (request.args.get("upcoming", "true") or "true").lower() != "false"

        if engine is None:
            return jsonify({"ok": True, "items": [], "mocked": True})

        with SessionLocal() as db:
            try:
                stmt = select(Event).where(Event.isPublished.is_(True))
                if upcoming:
                    now = datetime.now(tz=timezone.utc) - timedelta(hours=6)
                    stmt = stmt.where(Event.startAt >= now).order_by(asc(Event.startAt))
                else:
                    stmt = stmt.order_by(desc(Event.startAt))
                items = db.execute(stmt.limit(limit)).scalars().all()
                out = []
                for e in items:
                    out.append(
                        {
                            "id": e.id,
                            "slug": e.slug,
                            "title": e.title,
                            "description": e.description or None,
                            "location": e.location or None,
                            "posterUrl": e.posterUrl or None,
                            "startAt": e.startAt.replace(tzinfo=timezone.utc).isoformat().replace(
                                "+00:00", "Z"
                            )
                            if isinstance(e.startAt, datetime)
                            else str(e.startAt),
                            "endAt": e.endAt.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
                            if isinstance(e.endAt, datetime)
                            else (str(e.endAt) if e.endAt else None),
                            "isPublished": bool(e.isPublished),
                        }
                    )
                return jsonify({"ok": True, "items": out})
            except Exception as e:  # noqa: BLE001
                return jsonify({"ok": True, "items": [], "error": str(e)})

    @app.get(f"{api_prefix}/api/pastors")
    def list_pastors():
        limit = min(max(int(request.args.get("limit", "8") or "8"), 1), 50)
        if engine is None:
            return jsonify({"ok": True, "items": [], "mocked": True})

        with SessionLocal() as db:
            try:
                stmt = (
                    select(Pastor)
                    .where(Pastor.isPublished.is_(True))
                    .order_by(asc(Pastor.sortOrder), asc(Pastor.name))
                    .limit(limit)
                )
                items = db.execute(stmt).scalars().all()
                out = [
                    {
                        "id": p.id,
                        "slug": p.slug,
                        "name": p.name,
                        "roleTitle": p.roleTitle or None,
                        "bio": p.bio or None,
                        "photoUrl": p.photoUrl or None,
                        "sortOrder": int(p.sortOrder or 0),
                    }
                    for p in items
                ]
                return jsonify({"ok": True, "items": out})
            except Exception as e:  # noqa: BLE001
                return jsonify({"ok": True, "items": [], "error": str(e)})

    def normalize_ministry_row(m: Ministry):
        highlights = m.highlights
        if isinstance(highlights, dict) and "value" in highlights and isinstance(highlights["value"], list):
            highlights = highlights["value"]
        if not isinstance(highlights, list):
            highlights = []
        return {
            "id": m.id or m.slug,
            "slug": m.slug,
            "title": m.title,
            "description": m.description or None,
            "highlights": [h for h in highlights if h],
            "imageUrl": m.imageUrl or None,
            "sortOrder": int(m.sortOrder or 0),
        }

    @app.get(f"{api_prefix}/api/ministries")
    def list_ministries():
        limit = min(max(int(request.args.get("limit", "50") or "50"), 1), 200)

        if engine is None:
            fallback = []
            for m in (DEFAULT_SITE.get("ministries") or [])[:limit]:
                fallback.append(
                    {
                        "id": m.get("slug"),
                        "slug": m.get("slug"),
                        "title": m.get("title"),
                        "description": m.get("description"),
                        "highlights": m.get("highlights") or [],
                        "imageUrl": m.get("imageUrl") if isinstance(m, dict) else None,
                        "sortOrder": 0,
                    }
                )
            return jsonify({"ok": True, "items": fallback, "mocked": True})

        with SessionLocal() as db:
            try:
                stmt = (
                    select(Ministry)
                    .where(Ministry.isPublished.is_(True))
                    .order_by(asc(Ministry.sortOrder), asc(Ministry.title))
                    .limit(limit)
                )
                items = db.execute(stmt).scalars().all()
                return jsonify({"ok": True, "items": [normalize_ministry_row(m) for m in items]})
            except Exception:
                fallback = []
                for m in (DEFAULT_SITE.get("ministries") or [])[:limit]:
                    fallback.append(
                        {
                            "id": m.get("slug"),
                            "slug": m.get("slug"),
                            "title": m.get("title"),
                            "description": m.get("description"),
                            "highlights": m.get("highlights") or [],
                            "imageUrl": m.get("imageUrl") if isinstance(m, dict) else None,
                            "sortOrder": 0,
                        }
                    )
                return jsonify({"ok": True, "items": fallback, "mocked": True})

    def normalize_sermon_row(s: Sermon, category: Category | None):
        return {
            "id": s.id,
            "slug": s.slug,
            "title": s.title,
            "description": s.description or None,
            "speaker": s.speaker or None,
            "date": s.date.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
            if isinstance(s.date, datetime)
            else str(s.date),
            "durationMinutes": s.durationMinutes,
            "thumbnailUrl": s.thumbnailUrl or None,
            "videoUrl": s.videoUrl or None,
            "category": (
                {"id": category.id, "name": category.name, "slug": category.slug} if category else None
            ),
            "source": "db",
        }

    def normalize_youtube_sermon(v: YouTubeVideo):
        return {
            "id": v.videoId,
            "slug": v.videoId,
            "title": v.title,
            "description": v.description or None,
            "speaker": None,
            "date": v.publishedAt,
            "durationMinutes": v.durationMinutes,
            "thumbnailUrl": v.thumbnailUrl,
            "videoUrl": v.videoUrl,
            "category": {"id": "sermons", "name": "Sermons", "slug": "sermons"},
            "source": "youtube",
        }

    @app.get(f"{api_prefix}/api/sermons")
    def list_sermons():
        page = max(int(request.args.get("page", "1") or "1"), 1)
        limit = min(max(int(request.args.get("limit", "9") or "9"), 1), 48)
        category = request.args.get("category") or None
        q = request.args.get("q") or None
        source = (request.args.get("source") or "all").lower()
        need_count = page * limit
        include_youtube = source != "db" and has_youtube_source() and (not category or category == "sermons")

        db_categories: list[dict] = []
        db_items: list[dict] = []
        db_total = 0
        used_mock = False

        if source != "youtube":
            if engine is None:
                used_mock = True
                filtered = MOCK_SERMONS
                if category:
                    filtered = [s for s in filtered if (s.get("category") or {}).get("slug") == category]
                if q:
                    needle = q.lower().strip()
                    filtered = [
                        s
                        for s in filtered
                        if needle in f"{s.get('title','')} {s.get('speaker','')}".lower()
                    ]
                db_categories = MOCK_CATEGORIES
                db_total = len(filtered)
                db_items = filtered[:need_count]
            else:
                with SessionLocal() as db:
                    try:
                        categories_rows = (
                            db.execute(select(Category).order_by(asc(Category.name))).scalars().all()
                        )
                        db_categories = [
                            {"id": c.id, "name": c.name, "slug": c.slug} for c in categories_rows
                        ]

                        sermon_stmt = select(Sermon).order_by(desc(Sermon.date)).limit(need_count)
                        if category:
                            cat_row = (
                                db.execute(select(Category).where(Category.slug == category).limit(1))
                                .scalar_one_or_none()
                            )
                            if cat_row:
                                sermon_stmt = sermon_stmt.where(Sermon.categoryId == cat_row.id)
                            else:
                                sermon_stmt = sermon_stmt.where(Sermon.categoryId == "__none__")
                        if q:
                            needle = f"%{q}%"
                            sermon_stmt = sermon_stmt.where(
                                (Sermon.title.like(needle))
                                | (Sermon.description.like(needle))
                                | (Sermon.speaker.like(needle))
                            )
                        sermon_rows = db.execute(sermon_stmt).scalars().all()

                        category_by_id = {c.id: c for c in categories_rows}
                        db_items = [
                            normalize_sermon_row(s, category_by_id.get(s.categoryId)) for s in sermon_rows
                        ]
                        db_total = len(db_items)
                    except Exception:
                        used_mock = True
                        db_categories = MOCK_CATEGORIES
                        db_total = len(MOCK_SERMONS)
                        db_items = MOCK_SERMONS[:need_count]
        else:
            db_categories = []

        youtube_items: list[dict] = []
        youtube_total = 0
        if include_youtube:
            try:
                max_results = max(need_count, int(settings.youtube_max_results or 50))
                vids = get_youtube_videos(max_results=min(max_results, 500))
                needle = (q or "").strip().lower()
                if needle:
                    vids = [v for v in vids if needle in f"{v.title} {v.description or ''}".lower()]
                youtube_total = len(vids)
                youtube_items = [normalize_youtube_sermon(v) for v in vids]
            except Exception:
                youtube_items = []
                youtube_total = 0

        merged = (db_items or []) + (youtube_items or [])
        merged.sort(key=lambda x: x.get("date") or "", reverse=True)

        start = (page - 1) * limit
        items = merged[start : start + limit]

        categories_by_slug = {c["slug"]: c for c in (db_categories or [])}
        if include_youtube or source == "youtube":
            categories_by_slug.setdefault(
                "sermons", {"id": "sermons", "name": "Sermons", "slug": "sermons"}
            )

        db_source = "mock" if used_mock else "db"
        sources = ["youtube"] if source == "youtube" else [db_source] + (["youtube"] if include_youtube else [])

        return jsonify(
            {
                "categories": list(categories_by_slug.values()),
                "page": page,
                "limit": limit,
                "total": (db_total or 0) + (youtube_total or 0),
                "items": items,
                **({"mocked": True} if used_mock else {}),
                "sources": sources,
            }
        )

    @app.get(f"{api_prefix}/api/sermons/<sermon_id>")
    def get_sermon(sermon_id: str):
        if engine is None:
            match = next(
                (s for s in MOCK_SERMONS if s.get("id") == sermon_id or s.get("slug") == sermon_id),
                None,
            )
            if not match:
                abort(404)
            return jsonify(match)

        with SessionLocal() as db:
            row = (
                db.execute(select(Sermon).where((Sermon.id == sermon_id) | (Sermon.slug == sermon_id)).limit(1))
                .scalar_one_or_none()
            )
            if not row:
                abort(404)
            cat = (
                db.execute(select(Category).where(Category.id == row.categoryId).limit(1)).scalar_one_or_none()
                if row.categoryId
                else None
            )
            return jsonify(normalize_sermon_row(row, cat))

    _EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

    def _as_str(v) -> str:
        return "" if v is None else str(v)

    def _validate_contact(payload: dict) -> tuple[dict | None, dict | None]:
        name = _as_str(payload.get("name")).strip()
        email = _as_str(payload.get("email")).strip()
        phone = _as_str(payload.get("phone")).strip()
        subject = _as_str(payload.get("subject")).strip()
        message = _as_str(payload.get("message")).strip()

        errors: dict[str, str] = {}
        if len(name) < 2 or len(name) > 100:
            errors["name"] = "Must be 2-100 characters"
        if not _EMAIL_RE.match(email) or len(email) > 200:
            errors["email"] = "Must be a valid email"
        if phone and (len(phone) < 7 or len(phone) > 30):
            errors["phone"] = "Must be 7-30 characters"
        if subject and len(subject) > 120:
            errors["subject"] = "Must be <= 120 characters"
        if len(message) < 10 or len(message) > 5000:
            errors["message"] = "Must be 10-5000 characters"

        if errors:
            return None, errors

        return (
            {
                "name": name,
                "email": email,
                "phone": phone or None,
                "subject": subject or None,
                "message": message,
            },
            None,
        )

    @app.post(f"{api_prefix}/api/contact")
    def contact():
        data, errors = _validate_contact(request.get_json(silent=True) or {})
        if errors:
            return jsonify({"error": "Invalid payload", "details": errors}), 400

        if engine is None:
            return jsonify({"ok": True, "mocked": True})

        with SessionLocal() as db:
            try:
                msg = Message(
                    id=str(uuid4()),
                    name=data["name"],
                    email=data["email"],
                    phone=data["phone"],
                    subject=data["subject"],
                    message=data["message"],
                )
                db.add(msg)
                db.commit()
                return jsonify({"ok": True})
            except Exception:
                try:
                    db.rollback()
                except Exception:
                    pass
                return jsonify({"ok": True, "mocked": True})

    return app


app = create_app()
