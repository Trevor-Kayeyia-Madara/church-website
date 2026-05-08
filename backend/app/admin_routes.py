from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from flask import Flask, abort, jsonify, request
from sqlalchemy import asc, desc, select, update, delete, func
from sqlalchemy.orm import Session as SQLSession

from app.admin_auth import require_admin_auth, init_admin_db, AdminUser, _create_session, _revoke_all_admin_sessions, _validate_session
from app.db import SessionLocal
from app.models import Sermon, Event, Pastor, Ministry, Message, SiteSettings, GalleryItem, Category


def _to_iso(value) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
    return str(value)


def register_admin_routes(app: Flask) -> None:
    """Register all admin dashboard routes"""

    @app.post("/api/admin/auth/login")
    def admin_login():
        """Admin user login - creates a persistent session and returns it via httpOnly cookie"""
        json_data = request.get_json(silent=True) or {}
        username = json_data.get("username", "").strip()
        password = json_data.get("password", "").strip()

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        with SessionLocal() as db:
            user = db.execute(
                select(AdminUser).where(AdminUser.username == username, AdminUser.is_active == True)
            ).scalar_one_or_none()

            if not user or not user.check_password(password):
                return jsonify({"error": "Invalid credentials"}), 401

            # Create persistent session in database
            session_id = _create_session(user.id, days=7)

            response = jsonify({
                "ok": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            })
            # Set httpOnly cookie (secure in production, but works for both http/https)
            samesite = "Lax"
            response.set_cookie(
                "admin_session",
                session_id,
                httponly=True,
                max_age=7 * 24 * 3600,  # 7 days
                samesite=samesite,
            )
            return response

    @app.post("/api/admin/auth/google/callback")
    def admin_google_callback():
        """
        Google OAuth callback handler.
        Expected: POST with {"googleId": "...", "email": "...", "name": "..."}
        Creates or finds admin user and establishes session.
        This is a simplified version - in production use full OAuth2 flow.
        """
        json_data = request.get_json(silent=True) or {}
        google_id = json_data.get("googleId", "").strip()
        email = json_data.get("email", "").strip()
        name = json_data.get("name", "").strip()

        if not google_id or not email:
            return jsonify({"error": "Google ID and email required"}), 400

        with SessionLocal() as db:
            # Try to find admin by email
            user = db.execute(
                select(AdminUser).where(AdminUser.email == email, AdminUser.is_active == True)
            ).scalar_one_or_none()

            if not user:
                # Auto-create admin user from Google login
                # Auto-generate username from email
                username = email.split("@")[0].lower()
                # Handle duplicate usernames
                base_username = username
                counter = 1
                while db.execute(
                    select(AdminUser).where(AdminUser.username == username)
                ).scalar_one_or_none():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = AdminUser(
                    username=username,
                    email=email,
                    is_active=True,
                )
                # Set a random password (won't be used for Google-authed users)
                import secrets
                import string
                random_pass = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
                user.set_password(random_pass)
                db.add(user)
                db.commit()
                db.refresh(user)

            if not user.is_active:
                return jsonify({"error": "Admin account is not active"}), 403

            # Create persistent session
            session_id = _create_session(user.id, days=7)

            response = jsonify({
                "ok": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "method": "google",
                },
            })
            samesite = "Lax"
            response.set_cookie(
                "admin_session",
                session_id,
                httponly=True,
                max_age=7 * 24 * 3600,
                samesite=samesite,
            )
            return response

    @app.post("/api/admin/auth/logout")
    @require_admin_auth
    def admin_logout():
        """Logout - revoke the session"""
        cookie_header = request.headers.get("Cookie", "")
        cookie_match = cookie_header.match(r"admin_session=([^;]+)")
        session_id = cookie_match.group(1) if cookie_match else None

        if session_id:
            _revoke_session(session_id)

        response = jsonify({"ok": True})
        response.delete_cookie("admin_session")
        return response

    @app.post("/api/admin/auth/revoke-all")
    @require_admin_auth
    def admin_revoke_all():
        """Revoke all sessions for current user (e.g. on password change)"""
        _revoke_all_admin_sessions(request.admin_user.id)
        return jsonify({"ok": True, "message": "All sessions revoked"})

    @app.get("/api/admin/auth/me")
    @require_admin_auth
    def admin_me():
        """Get current admin user info"""
        return jsonify({
            "ok": True,
            "authenticated": True,
            "user": {
                "id": request.admin_user.id,
                "username": request.admin_user.username,
                "email": request.admin_user.email,
            },
        })

    # ============ ADMIN CRUD ENDPOINTS ============

    # ---- Sermons Admin ----
    @app.get("/api/admin/sermons")
    @require_admin_auth
    def admin_list_sermons():
        limit = min(max(int(request.args.get("limit", "50")), 1), 200)
        page = max(int(request.args.get("page", "1")), 1)

        with SessionLocal() as db:
            stmt = select(Sermon).order_by(desc(Sermon.date)).limit(limit).offset((page - 1) * limit)
            sermon_rows = db.execute(stmt).scalars().all()
            total = db.execute(select(func.count(Sermon.id))).scalar_one()

            # Fetch all categories for mapping
            categories_rows = db.execute(select(Category).order_by(asc(Category.name))).scalars().all()
            categories_by_id = {c.id: {"id": c.id, "name": c.name, "slug": c.slug} for c in categories_rows}
            categories_list = [{"id": c.id, "name": c.name, "slug": c.slug} for c in categories_rows]

            items = []
            for s in sermon_rows:
                cat = categories_by_id.get(s.categoryId) if s.categoryId else None
                items.append({
                    "id": s.id,
                    "slug": s.slug,
                    "title": s.title,
                    "description": s.description or None,
                    "speaker": s.speaker or None,
                    "date": _to_iso(s.date),
                    "durationMinutes": s.durationMinutes,
                    "thumbnailUrl": s.thumbnailUrl or None,
                    "videoUrl": s.videoUrl or None,
                    "categoryId": s.categoryId or None,
                    "category": cat,
                    "createdAt": _to_iso(s.createdAt),
                    "updatedAt": _to_iso(s.updatedAt),
                })

            return jsonify({
                "ok": True,
                "items": items,
                "categories": categories_list,
                "total": total,
                "page": page,
                "limit": limit,
            })

    @app.post("/api/admin/sermons")
    @require_admin_auth
    def admin_create_sermon():
        json_data = request.get_json(silent=True) or {}
        title = json_data.get("title", "").strip()
        if not title:
            return jsonify({"error": "Title is required"}), 400

        date = json_data.get("date")
        try:
            date = datetime.fromisoformat(date) if date else datetime.now(tz=timezone.utc)
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400

        slug = json_data.get("slug", "").strip() or f"{title.lower().replace(' ', '-')}-{date.strftime('%Y-%m-%d')}"

        with SessionLocal() as db:
            existing = db.execute(select(Sermon).where(Sermon.slug == slug)).scalar_one_or_none()
            if existing:
                slug = f"{slug}-{int(datetime.now().timestamp())}"

            # Handle category if provided via slug/name
            resolved_category_id = json_data.get("categoryId")
            category_slug = json_data.get("categorySlug", "").strip()
            category_name = (json_data.get("categoryName") or "").strip()
            if category_slug:
                cat = db.execute(select(Category).where(Category.slug == category_slug)).scalar_one_or_none()
                if cat:
                    resolved_category_id = cat.id
                    if category_name and cat.name != category_name:
                        cat.name = category_name
                        db.commit()
                else:
                    new_cat = Category(
                        id=str(uuid.uuid4()),
                        slug=category_slug,
                        name=category_name or category_slug,
                    )
                    db.add(new_cat)
                    db.commit()
                    resolved_category_id = new_cat.id

            sermon = Sermon(
                id=str(uuid.uuid4()),
                slug=slug,
                title=title,
                description=json_data.get("description"),
                speaker=json_data.get("speaker"),
                date=date,
                durationMinutes=json_data.get("durationMinutes"),
                thumbnailUrl=json_data.get("thumbnailUrl"),
                videoUrl=json_data.get("videoUrl"),
                categoryId=resolved_category_id,
            )
            db.add(sermon)
            db.commit()
            db.refresh(sermon)

            return jsonify({"ok": True, "item": {"id": sermon.id, "slug": sermon.slug, "title": sermon.title}})

    @app.route("/api/admin/sermons/<sermon_id>", methods=["GET", "PUT", "DELETE"])
    @require_admin_auth
    def admin_sermon_detail(sermon_id: str):
        with SessionLocal() as db:
            if request.method == "GET":
                sermon = db.execute(select(Sermon).where(Sermon.id == sermon_id)).scalar_one_or_none()
                if not sermon:
                    return jsonify({"error": "Not found"}), 404
                cat = None
                if sermon.categoryId:
                    cat_row = db.execute(select(Category).where(Category.id == sermon.categoryId)).scalar_one_or_none()
                    if cat_row:
                        cat = {"id": cat_row.id, "name": cat_row.name, "slug": cat_row.slug}
                return jsonify({
                    "ok": True,
                    "item": {
                        "id": sermon.id,
                        "slug": sermon.slug,
                        "title": sermon.title,
                        "description": sermon.description or None,
                        "speaker": sermon.speaker or None,
                        "date": _to_iso(sermon.date),
                        "durationMinutes": sermon.durationMinutes,
                        "thumbnailUrl": sermon.thumbnailUrl or None,
                        "videoUrl": sermon.videoUrl or None,
                        "categoryId": sermon.categoryId or None,
                        "category": cat,
                        "createdAt": _to_iso(sermon.createdAt),
                        "updatedAt": _to_iso(sermon.updatedAt),
                    }
                })

            elif request.method == "PUT":
                sermon = db.execute(select(Sermon).where(Sermon.id == sermon_id)).scalar_one_or_none()
                if not sermon:
                    return jsonify({"error": "Not found"}), 404

                data = request.get_json(silent=True) or {}
                for field in ["title", "description", "speaker", "durationMinutes", "thumbnailUrl", "videoUrl", "categoryId"]:
                    if field in data:
                        setattr(sermon, field, data[field])

                if "date" in data:
                    try:
                        sermon.date = datetime.fromisoformat(data["date"])
                    except ValueError:
                        pass

                if "slug" in data and data["slug"]:
                    sermon.slug = data["slug"]

                db.commit()
                return jsonify({"ok": True, "message": "Sermon updated"})

            elif request.method == "DELETE":
                sermon = db.execute(select(Sermon).where(Sermon.id == sermon_id)).scalar_one_or_none()
                if not sermon:
                    return jsonify({"error": "Not found"}), 404
                db.delete(sermon)
                db.commit()
                return jsonify({"ok": True, "message": "Sermon deleted"})

    # ---- Events Admin ----
    @app.get("/api/admin/events")
    @require_admin_auth
    def admin_list_events():
        limit = min(max(int(request.args.get("limit", "50")), 1), 200)
        page = max(int(request.args.get("page", "1")), 1)

        with SessionLocal() as db:
            stmt = select(Event).order_by(desc(Event.startAt)).limit(limit).offset((page - 1) * limit)
            items = db.execute(stmt).scalars().all()
            total = db.execute(select(func.count(Event.id))).scalar_one()

            return jsonify({
                "ok": True,
                "items": [
                    {
                        "id": e.id,
                        "slug": e.slug,
                        "title": e.title,
                        "description": e.description or None,
                        "location": e.location or None,
                        "posterUrl": e.posterUrl or None,
                        "startAt": _to_iso(e.startAt),
                        "endAt": _to_iso(e.endAt),
                        "isPublished": bool(e.isPublished),
                        "createdAt": _to_iso(e.createdAt),
                        "updatedAt": _to_iso(e.updatedAt),
                    }
                    for e in items
                ],
                "total": total,
                "page": page,
                "limit": limit,
            })

    @app.post("/api/admin/events")
    @require_admin_auth
    def admin_create_event():
        json_data = request.get_json(silent=True) or {}
        title = json_data.get("title", "").strip()
        if not title:
            return jsonify({"error": "Title is required"}), 400

        start_at = json_data.get("startAt")
        try:
            start_at = datetime.fromisoformat(start_at) if start_at else datetime.now(tz=timezone.utc)
        except ValueError:
            return jsonify({"error": "Invalid startAt format"}), 400

        slug = json_data.get("slug", "").strip() or f"{title.lower().replace(' ', '-')}-{start_at.strftime('%Y-%m-%d')}"

        with SessionLocal() as db:
            existing = db.execute(select(Event).where(Event.slug == slug)).scalar_one_or_none()
            if existing:
                slug = f"{slug}-{int(datetime.now().timestamp())}"

            event = Event(
                id=str(uuid.uuid4()),
                slug=slug,
                title=title,
                description=json_data.get("description"),
                location=json_data.get("location"),
                posterUrl=json_data.get("posterUrl"),
                startAt=start_at,
                endAt=datetime.fromisoformat(json_data["endAt"]) if json_data.get("endAt") else None,
                isPublished=bool(json_data.get("isPublished", True)),
            )
            db.add(event)
            db.commit()
            db.refresh(event)

            return jsonify({"ok": True, "item": {"id": event.id, "slug": event.slug, "title": event.title}})

    @app.route("/api/admin/events/<event_id>", methods=["GET", "PUT", "DELETE"])
    @require_admin_auth
    def admin_event_detail(event_id: str):
        with SessionLocal() as db:
            if request.method == "GET":
                event = db.execute(select(Event).where(Event.id == event_id)).scalar_one_or_none()
                if not event:
                    return jsonify({"error": "Not found"}), 404
                return jsonify({
                    "ok": True,
                    "item": {
                        "id": event.id,
                        "slug": event.slug,
                        "title": event.title,
                        "description": event.description or None,
                        "location": event.location or None,
                        "posterUrl": event.posterUrl or None,
                        "startAt": _to_iso(event.startAt),
                        "endAt": _to_iso(event.endAt),
                        "isPublished": bool(event.isPublished),
                        "createdAt": _to_iso(event.createdAt),
                        "updatedAt": _to_iso(event.updatedAt),
                    }
                })

            elif request.method == "PUT":
                event = db.execute(select(Event).where(Event.id == event_id)).scalar_one_or_none()
                if not event:
                    return jsonify({"error": "Not found"}), 404

                data = request.get_json(silent=True) or {}
                for field in ["title", "description", "location", "posterUrl", "isPublished"]:
                    if field in data:
                        setattr(event, field, data[field])

                if "startAt" in data:
                    try:
                        event.startAt = datetime.fromisoformat(data["startAt"])
                    except ValueError:
                        pass
                if "endAt" in data:
                    try:
                        event.endAt = datetime.fromisoformat(data["endAt"]) if data["endAt"] else None
                    except ValueError:
                        pass

                if "slug" in data and data["slug"]:
                    event.slug = data["slug"]

                db.commit()
                return jsonify({"ok": True, "message": "Event updated"})

            elif request.method == "DELETE":
                event = db.execute(select(Event).where(Event.id == event_id)).scalar_one_or_none()
                if not event:
                    return jsonify({"error": "Not found"}), 404
                db.delete(event)
                db.commit()
                return jsonify({"ok": True, "message": "Event deleted"})

    # ---- Pastors Admin ----
    @app.get("/api/admin/pastors")
    @require_admin_auth
    def admin_list_pastors():
        with SessionLocal() as db:
            items = db.execute(select(Pastor).order_by(asc(Pastor.sortOrder), asc(Pastor.name))).scalars().all()
            return jsonify({
                "ok": True,
                "items": [
                    {
                        "id": p.id,
                        "slug": p.slug,
                        "name": p.name,
                        "roleTitle": p.roleTitle or None,
                        "bio": p.bio or None,
                        "photoUrl": p.photoUrl or None,
                        "sortOrder": p.sortOrder,
                        "isPublished": bool(p.isPublished),
                    }
                    for p in items
                ]
            })

    @app.post("/api/admin/pastors")
    @require_admin_auth
    def admin_create_pastor():
        json_data = request.get_json(silent=True) or {}
        name = json_data.get("name", "").strip()
        if not name:
            return jsonify({"error": "Name is required"}), 400

        slug = json_data.get("slug", "").strip() or name.lower().replace(" ", "-")

        with SessionLocal() as db:
            existing = db.execute(select(Pastor).where(Pastor.slug == slug)).scalar_one_or_none()
            if existing:
                slug = f"{slug}-{int(datetime.now().timestamp())}"

            pastor = Pastor(
                id=str(uuid.uuid4()),
                slug=slug,
                name=name,
                roleTitle=json_data.get("roleTitle"),
                bio=json_data.get("bio"),
                photoUrl=json_data.get("photoUrl"),
                sortOrder=int(json_data.get("sortOrder", 0)),
                isPublished=bool(json_data.get("isPublished", True)),
            )
            db.add(pastor)
            db.commit()
            db.refresh(pastor)

            return jsonify({"ok": True, "item": {"id": pastor.id, "slug": pastor.slug, "name": pastor.name}})

    @app.route("/api/admin/pastors/<pastor_id>", methods=["GET", "PUT", "DELETE"])
    @require_admin_auth
    def admin_pastor_detail(pastor_id: str):
        with SessionLocal() as db:
            if request.method == "GET":
                pastor = db.execute(select(Pastor).where(Pastor.id == pastor_id)).scalar_one_or_none()
                if not pastor:
                    return jsonify({"error": "Not found"}), 404
                return jsonify({
                    "ok": True,
                    "item": {
                        "id": pastor.id,
                        "slug": pastor.slug,
                        "name": pastor.name,
                        "roleTitle": pastor.roleTitle or None,
                        "bio": pastor.bio or None,
                        "photoUrl": pastor.photoUrl or None,
                        "sortOrder": pastor.sortOrder,
                        "isPublished": bool(pastor.isPublished),
                        "createdAt": _to_iso(pastor.createdAt),
                        "updatedAt": _to_iso(pastor.updatedAt),
                    }
                })

            elif request.method == "PUT":
                pastor = db.execute(select(Pastor).where(Pastor.id == pastor_id)).scalar_one_or_none()
                if not pastor:
                    return jsonify({"error": "Not found"}), 404

                data = request.get_json(silent=True) or {}
                for field in ["name", "roleTitle", "bio", "photoUrl", "isPublished"]:
                    if field in data:
                        setattr(pastor, field, data[field])
                if "sortOrder" in data:
                    pastor.sortOrder = int(data["sortOrder"])
                if "slug" in data and data["slug"]:
                    pastor.slug = data["slug"]

                db.commit()
                return jsonify({"ok": True, "message": "Pastor updated"})

            elif request.method == "DELETE":
                pastor = db.execute(select(Pastor).where(Pastor.id == pastor_id)).scalar_one_or_none()
                if not pastor:
                    return jsonify({"error": "Not found"}), 404
                db.delete(pastor)
                db.commit()
                return jsonify({"ok": True, "message": "Pastor deleted"})

    # ---- Ministries Admin ----
    @app.get("/api/admin/ministries")
    @require_admin_auth
    def admin_list_ministries():
        with SessionLocal() as db:
            items = db.execute(select(Ministry).order_by(asc(Ministry.sortOrder), asc(Ministry.title))).scalars().all()
            return jsonify({
                "ok": True,
                "items": [
                    {
                        "id": m.id,
                        "slug": m.slug,
                        "title": m.title,
                        "description": m.description or None,
                        "highlights": m.highlights or [],
                        "imageUrl": m.imageUrl or None,
                        "sortOrder": m.sortOrder,
                        "isPublished": bool(m.isPublished),
                    }
                    for m in items
                ]
            })

    @app.post("/api/admin/ministries")
    @require_admin_auth
    def admin_create_ministry():
        json_data = request.get_json(silent=True) or {}
        title = json_data.get("title", "").strip()
        if not title:
            return jsonify({"error": "Title is required"}), 400

        slug = json_data.get("slug", "").strip() or title.lower().replace(" ", "-")

        with SessionLocal() as db:
            existing = db.execute(select(Ministry).where(Ministry.slug == slug)).scalar_one_or_none()
            if existing:
                slug = f"{slug}-{int(datetime.now().timestamp())}"

            highlights = json_data.get("highlights")
            if isinstance(highlights, str):
                try:
                    import json
                    highlights = json.loads(highlights)
                except Exception:
                    highlights = []
            if highlights is None:
                highlights = []

            ministry = Ministry(
                id=str(uuid.uuid4()),
                slug=slug,
                title=title,
                description=json_data.get("description"),
                highlights=highlights,
                imageUrl=json_data.get("imageUrl"),
                sortOrder=int(json_data.get("sortOrder", 0)),
                isPublished=bool(json_data.get("isPublished", True)),
            )
            db.add(ministry)
            db.commit()
            db.refresh(ministry)

            return jsonify({"ok": True, "item": {"id": ministry.id, "slug": ministry.slug, "title": ministry.title}})

    @app.route("/api/admin/ministries/<ministry_id>", methods=["GET", "PUT", "DELETE"])
    @require_admin_auth
    def admin_ministry_detail(ministry_id: str):
        with SessionLocal() as db:
            if request.method == "GET":
                ministry = db.execute(select(Ministry).where(Ministry.id == ministry_id)).scalar_one_or_none()
                if not ministry:
                    return jsonify({"error": "Not found"}), 404
                return jsonify({
                    "ok": True,
                    "item": {
                        "id": ministry.id,
                        "slug": ministry.slug,
                        "title": ministry.title,
                        "description": ministry.description or None,
                        "highlights": ministry.highlights or [],
                        "imageUrl": ministry.imageUrl or None,
                        "sortOrder": ministry.sortOrder,
                        "isPublished": bool(ministry.isPublished),
                        "createdAt": _to_iso(ministry.createdAt),
                        "updatedAt": _to_iso(ministry.updatedAt),
                    }
                })

            elif request.method == "PUT":
                ministry = db.execute(select(Ministry).where(Ministry.id == ministry_id)).scalar_one_or_none()
                if not ministry:
                    return jsonify({"error": "Not found"}), 404

                data = request.get_json(silent=True) or {}
                for field in ["title", "description", "imageUrl", "isPublished"]:
                    if field in data:
                        setattr(ministry, field, data[field])

                if "highlights" in data:
                    highlights = data["highlights"]
                    if isinstance(highlights, str):
                        try:
                            import json
                            highlights = json.loads(highlights)
                        except Exception:
                            highlights = []
                    ministry.highlights = highlights

                if "sortOrder" in data:
                    ministry.sortOrder = int(data["sortOrder"])
                if "slug" in data and data["slug"]:
                    ministry.slug = data["slug"]

                db.commit()
                return jsonify({"ok": True, "message": "Ministry updated"})

            elif request.method == "DELETE":
                ministry = db.execute(select(Ministry).where(Ministry.id == ministry_id)).scalar_one_or_none()
                if not ministry:
                    return jsonify({"error": "Not found"}), 404
                db.delete(ministry)
                db.commit()
                return jsonify({"ok": True, "message": "Ministry deleted"})

    # ---- Messages (Contact Form Submissions) Admin ----
    @app.get("/api/admin/messages")
    @require_admin_auth
    def admin_list_messages():
        limit = min(max(int(request.args.get("limit", "50")), 1), 200)
        page = max(int(request.args.get("page", "1")), 1)

        with SessionLocal() as db:
            stmt = select(Message).order_by(desc(Message.createdAt)).limit(limit).offset((page - 1) * limit)
            items = db.execute(stmt).scalars().all()
            total = db.execute(select(func.count(Message.id))).scalar_one()

            return jsonify({
                "ok": True,
                "items": [
                    {
                        "id": m.id,
                        "name": m.name,
                        "email": m.email,
                        "phone": m.phone or None,
                        "subject": m.subject or None,
                        "message": m.message[:200] + ("..." if len(m.message) > 200 else ""),
                        "fullMessage": m.message,
                        "createdAt": _to_iso(m.createdAt),
                    }
                    for m in items
                ],
                "total": total,
                "page": page,
                "limit": limit,
            })

    # ---- Site Settings Admin ----
    @app.get("/api/admin/settings")
    @require_admin_auth
    def admin_get_settings():
        with SessionLocal() as db:
            row = db.execute(select(SiteSettings).order_by(asc(SiteSettings.id)).limit(1)).scalar_one_or_none()
            if not row:
                return jsonify({"error": "Settings not found"}), 404

            from app.defaults import DEFAULT_SITE
            import json

            settings = {
                "siteName": row.siteName or DEFAULT_SITE["name"],
                "shortName": row.shortName or DEFAULT_SITE["shortName"],
                "tagline": row.tagline or DEFAULT_SITE["tagline"],
                "location": row.location or DEFAULT_SITE["location"],
                "logoUrl": row.logoUrl or DEFAULT_SITE.get("logoUrl"),
                "liveEmbedUrl": row.liveEmbedUrl or DEFAULT_SITE.get("liveEmbedUrl"),
                "serviceTimes": row.serviceTimes or DEFAULT_SITE.get("serviceTimes"),
                "school": row.school or DEFAULT_SITE.get("school"),
                "giving": row.giving or DEFAULT_SITE.get("giving"),
                "contact": {
                    "addressLine1": row.addressLine1 or DEFAULT_SITE["contact"]["addressLine1"],
                    "addressLine2": row.addressLine2 or DEFAULT_SITE["contact"]["addressLine2"],
                    "phoneDisplay": row.phoneDisplay or DEFAULT_SITE["contact"]["phoneDisplay"],
                    "phoneTel": row.phoneTel or DEFAULT_SITE["contact"]["phoneTel"],
                    "email": row.email or DEFAULT_SITE["contact"]["email"],
                },
                "social": {
                    "youtube": row.youtubeUrl or DEFAULT_SITE["social"]["youtube"],
                    "facebook": row.facebookUrl or DEFAULT_SITE["social"]["facebook"],
                    "instagram": row.instagramUrl or DEFAULT_SITE["social"]["instagram"],
                    "tiktok": row.tiktokUrl or DEFAULT_SITE["social"]["tiktok"],
                    "linktree": row.linktreeUrl or DEFAULT_SITE["social"]["linktree"],
                },
                "createdAt": _to_iso(row.createdAt),
                "updatedAt": _to_iso(row.updatedAt),
            }
            return jsonify({"ok": True, "settings": settings})

    @app.put("/api/admin/settings")
    @require_admin_auth
    def admin_update_settings():
        with SessionLocal() as db:
            row = db.execute(select(SiteSettings).order_by(asc(SiteSettings.id)).limit(1)).scalar_one_or_none()
            if not row:
                row = SiteSettings()

            data = request.get_json(silent=True) or {}

            for field in ["siteName", "shortName", "tagline", "location", "logoUrl", "liveEmbedUrl"]:
                if field in data:
                    setattr(row, field, data[field] or None)

            for field in ["addressLine1", "addressLine2", "phoneDisplay", "phoneTel", "email"]:
                if field in data:
                    setattr(row, field, data.get("contact", {}).get(field) or None)

            social_fields = ["youtubeUrl", "facebookUrl", "instagramUrl", "tiktokUrl", "linktreeUrl"]
            for field in social_fields:
                if field in data:
                    setattr(row, field, data.get("social", {}).get(field.split("Url")[0].lower(), None))

            db.add(row)
            db.commit()
            return jsonify({"ok": True, "message": "Settings updated"})

    # ---- Gallery Admin ----
    @app.get("/api/admin/gallery")
    @require_admin_auth
    def admin_list_gallery():
        from app.models import GalleryItem  # lazy import
        with SessionLocal() as db:
            items = db.execute(select(GalleryItem).order_by(desc(GalleryItem.createdAt))).scalars().all()
            return jsonify({
                "ok": True,
                "items": [
                    {
                        "id": g.id,
                        "imageUrl": g.imageUrl or None,
                        "caption": g.caption or None,
                        "sortOrder": g.sortOrder,
                        "isPublished": bool(g.isPublished),
                        "createdAt": _to_iso(g.createdAt),
                    }
                    for g in items
                ]
            })

    @app.post("/api/admin/gallery")
    @require_admin_auth
    def admin_create_gallery():
        from app.models import GalleryItem
        json_data = request.get_json(silent=True) or {}

        with SessionLocal() as db:
            item = GalleryItem(
                id=str(uuid.uuid4()),
                imageUrl=json_data.get("imageUrl"),
                caption=json_data.get("caption"),
                sortOrder=int(json_data.get("sortOrder", 0)),
                isPublished=bool(json_data.get("isPublished", True)),
            )
            db.add(item)
            db.commit()
            return jsonify({"ok": True, "item": {"id": item.id}})

    @app.route("/api/admin/gallery/<item_id>", methods=["PUT", "DELETE"])
    @require_admin_auth
    def admin_gallery_detail(item_id: str):
        from app.models import GalleryItem
        with SessionLocal() as db:
            if request.method == "PUT":
                item = db.execute(select(GalleryItem).where(GalleryItem.id == item_id)).scalar_one_or_none()
                if not item:
                    return jsonify({"error": "Not found"}), 404
                data = request.get_json(silent=True) or {}
                for field in ["imageUrl", "caption", "sortOrder", "isPublished"]:
                    if field in data:
                        setattr(item, field, data[field if field != "isPublished" else "isPublished"])
                item.sortOrder = int(data.get("sortOrder", item.sortOrder))
                db.commit()
                return jsonify({"ok": True, "message": "Gallery item updated"})

            elif request.method == "DELETE":
                item = db.execute(select(GalleryItem).where(GalleryItem.id == item_id)).scalar_one_or_none()
                if not item:
                    return jsonify({"error": "Not found"}), 404
                db.delete(item)
                db.commit()
                return jsonify({"ok": True, "message": "Gallery item deleted"})
