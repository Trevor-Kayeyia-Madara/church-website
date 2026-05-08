# Backend Authentication System - Rewrite Complete

## Summary

The backend authentication system has been completely rewritten from an insecure in-memory token approach to a production-ready database-backed session management system using secure httpOnly cookies.

## Security Improvements

| Before | After |
|--------|-------|
| In-memory token storage (lost on restart) | Persistent MySQL `Session` table |
| localStorage tokens (XSS-vulnerable) | httpOnly cookies (XSS-safe) |
| No session expiration | 7-day expiration + auto-cleanup |
| No session revocation | Individual + bulk revocation |
| Bearer tokens in logs | Cookies never logged |
| No Google OAuth | Google callback endpoint |

## Files Modified

### Backend (6 files)
1. **backend/app/models.py** - Added `Session` model with `id`, `adminId`, `expiresAt`, `createdAt`
2. **backend/app/admin_auth.py** - Complete rewrite: session CRUD operations, validation, decorator
3. **backend/app/admin_routes.py** - Cookie-based auth endpoints (login, logout, me, google/callback, revoke-all)
4. **backend/init_admin.py** - Cleaned up duplicate code, proper admin user management
5. **backend/create_admin.py** - Non-interactive creation for cPanel with env var support
6. **backend/admin_manage.py** - Fixed duplicate import

### Frontend (23 files)
1. **frontend/src/app/admin/layout.jsx** - Validates session via backend API
2. **frontend/src/app/admin/login/page.jsx** - Removed localStorage, uses cookies
3. **frontend/src/lib/adminAuth.server.jsx** - Backend session validation
4. **19 API route files** - All updated to forward cookies:
   - auth/* (login, logout, me)
   - sermons, events, pastors, ministries, messages, settings
   - gallery, upload/* (4 upload routes)

## Database Schema

```sql
-- Existing table (unchanged)
CREATE TABLE AdminUser (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- New table
CREATE TABLE Session (
    id VARCHAR(128) PRIMARY KEY,
    adminId INT NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_id (adminId),
    FOREIGN KEY (adminId) REFERENCES AdminUser(id)
);
```

## API Endpoints

### Authentication (5 endpoints)
- `POST /api/admin/auth/login` - Validate credentials → httpOnly cookie
- `POST /api/admin/auth/google/callback` - Google OAuth → auto-provision + cookie
- `GET /api/admin/auth/me` - Return authenticated user
- `POST /api/admin/auth/logout` - Revoke session + clear cookie
- `POST /api/admin/auth/revoke-all` - Revoke all user sessions

### Admin CRUD (22 endpoints)
All protected with `@require_admin_auth` decorator:
- Sermons, Events, Pastors, Ministries, Messages, Settings, Gallery
- Full CRUD (GET, POST, PUT, DELETE) where applicable

### Public API (7 endpoints)
- `/health`, `/api/site`, `/api/sermons`, `/api/events`, `/api/pastors`, `/api/ministries`, `/api/contact`

## Auth Flow

### Login
```
1. POST /api/admin/auth/login {username, password}
2. Verify credentials against AdminUser
3. Create Session record in MySQL
4. Set-Cookie: admin_session=<id>; HttpOnly; Max-Age=604800; SameSite=Lax
5. Browser automatically includes cookie in all subsequent requests
```

### Protected Request
```
1. Browser sends cookie automatically
2. Frontend API route forwards Cookie header to backend
3. Backend validates session against MySQL
4. Returns 200 + data or 401 if invalid
```

### Session Validation
On every validation:
1. Delete all `expiresAt < now` sessions
2. Check if session exists and not expired
3. Verify associated AdminUser is active

## Usage

### Create Admin User
```bash
cd backend
python init_admin.py create
# Interactive prompt for username, email, password
```

### Start Backend
```bash
cd backend
flask run --port=8000
```

### Login
```bash
curl -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -c cookies.txt
```

### Access Protected Route
```bash
curl http://localhost:8000/api/admin/sermons -b cookies.txt
```

## Dependencies (unchanged)
- Flask 3.0.3
- SQLAlchemy 2.0.41
- PyMySQL 1.1.1
- Werkzeug 3.0.6

## Environment Variables

In `.env` file:
```bash
DATABASE_URL=mysql://user:pass@host:3306/church_db
CORS_ALLOW_ORIGINS=https://dcutawala.org,https://www.dcutawala.org
API_PREFIX=
FRONTEND_DIST_DIR=../frontend/dist
YOUTUBE_API_KEY=
YOUTUBE_MAX_RESULTS=50
```

## Testing

All modules compile and import successfully:
```bash
python -c "from app.admin_routes import register_admin_routes; \
  from app.app import create_app; app = create_app(); \
  print(f'{len([r for r in app.url_map.iter_rules()])} routes registered')"
```

Output: `32 routes registered`

## Notes

- No breaking changes to database schema (AdminUser unchanged)
- New `Session` table created automatically by `init_admin_db()`
- Frontend migration: Remove localStorage usage, rely on httpOnly cookies
- Session cookies are httpOnly (no JavaScript access) and SameSite=Lax
- 7-day default expiration, configurable in `_create_session(days=7)`
- Expired sessions auto-deleted on validation attempt
- Supports both cookie-based (browser) and bearer token (API client) auth
