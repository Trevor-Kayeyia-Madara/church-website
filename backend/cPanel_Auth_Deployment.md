# cPanel Deployment - Backend Auth System (Updated)

## File Structure
```
/backend-app/                          (Python app at /domains/dcutawala.org/backend-app)
├── passenger_wsgi.py                 (WSGI entry point)
├── requirements.txt
├── .env                               (database + config)
├── init_admin.py                      (create admin user)
├── create_admin.py                    (non-interactive)
├── admin_manage.py                    (manage admins)
├── app/
│   ├── app.py                         (Flask app factory)
│   ├── admin_auth.py                  (NEW: session auth)
│   ├── admin_routes.py                (NEW: cookie auth)
│   ├── models.py                      (NEW: Session model)
│   ├── config.py
│   ├── db.py
│   └── ...

/domains/dcutawala.org/public_html/    (Frontend Next.js app)
└── ...
```

## What Changed (Auth System Rewrite)

### New Database Table
**Session** table stores persistent sessions:
- `id` VARCHAR(128) PRIMARY KEY
- `adminId` INT (FK to AdminUser)
- `expiresAt` DATETIME
- `createdAt` DATETIME

### New Auth Endpoints (all under /api/admin/auth/)
1. `POST /login` - Password login, sets httpOnly cookie
2. `POST /google/callback` - Google OAuth, sets httpOnly cookie  
3. `GET /me` - Verify session, return user
4. `POST /logout` - Revoke session, clear cookie
5. `POST /revoke-all` - Revoke all user sessions

### All Admin CRUD Routes Protected
- `/api/admin/sermons/*`
- `/api/admin/events/*`
- `/api/admin/pastors/*`
- `/api/admin/ministries/*`
- `/api/admin/messages/*`
- `/api/admin/settings/*`
- `/api/admin/gallery/*`

## cPanel Setup Steps

### 1. Upload Files
Upload backend files to `/domains/dcutawala.org/backend-app/` via cPanel File Manager or FTP.

### 2. Create Python App
cPanel → **Setup Python App** → Create:
- Python: 3.11 or 3.12
- Root: `/domains/dcutawala.org/backend-app`
- Startup: `passenger_wsgi.py`
- Entry: `application`

### 3. Install Requirements
cPanel Terminal:
```bash
cd /domains/dcutawala.org/backend-app
pip install -r requirements.txt
```

### 4. Configure .env
Create `/domains/dcutawala.org/backend-app/.env`:
```bash
DATABASE_URL=mysql://user:pass@localhost:3306/church_db
CORS_ALLOW_ORIGINS=https://dcutawala.org,https://www.dcutawala.org
API_PREFIX=
FLASK_ENV=production
FLASK_DEBUG=0

# Optional for Google OAuth frontend integration:
# GOOGLE_CLIENT_ID=your_client_id
```

### 5. Setup MySQL
cPanel → **MySQL Databases**:
- Create database: `church_db`
- Create user: `church_user` (strong password)
- Add privileges: ALL PRIVILEGES
- Update `DATABASE_URL` in `.env`

### 6. Initialize Admin
cPanel Terminal:
```bash
cd /domains/dcutawala.org/backend-app
python init_admin.py create
# Follow prompts for username, email, password
```

### 7. Configure Subdomain
cPanel → **Subdomains**:
- Subdomain: `api`
- Domain: `dcutawala.org`
- Document Root: `/domains/dcutawala.org/backend-app`

### 8. Verify
```bash
curl https://api.dcutawala.org/health
# Should return: {"ok":true}
```

## Testing Admin Authentication

### Login
```bash
curl -X POST https://api.dcutawala.org/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}' \
  -c cookies.txt -v
```
Check response includes: `Set-Cookie: admin_session=<token>`

### Verify Session
```bash
curl https://api.dcutawala.org/api/admin/auth/me -b cookies.txt
# Returns user data
```

### Access Protected Route
```bash
curl https://api.dcutawala.org/api/admin/sermons -b cookies.txt
# Returns sermon list
```

### Logout
```bash
curl -X POST https://api.dcutawala.org/api/admin/auth/logout -b cookies.txt
# Revokes session, clears cookie
```

## Frontend Configuration

In Next.js frontend (`.env.local`):
```bash
NEXT_PUBLIC_BACKEND_URL=https://api.dcutawala.org
```

The frontend `/admin/layout.jsx` automatically:
1. Sends cookies to backend `/api/admin/auth/me`
2. Validates session
3. Redirects to `/admin/login` if not authenticated

## Security Features

- **httpOnly Cookies**: Tokens not accessible via JavaScript (XSS-safe)
- **Session Expiration**: 7 days, auto-cleanup of expired sessions
- **Session Revocation**: Revoke individual or all sessions
- **Database-Backed**: Sessions survive server restarts
- **SameSite=Lax**: CSRF protection
- **All Routes Protected**: Every admin endpoint requires auth

## Troubleshooting

### 500 Error on Login
- Check `.env` exists and `DATABASE_URL` is correct
- Verify MySQL user has privileges
- Check error log: `tail -f /home/dcutawal/logs/error_log`

### 401 Unauthorized
- Cookie not being sent (CORS/browser settings)
- Session expired or revoked
- Check: `curl -v https://api.dcutawala.org/api/admin/auth/me -b cookies.txt`

### Database Import Error
- Tables auto-created by `init_admin_db()`
- If table exists, no error (checkfirst=True)
- Manually verify: `SHOW TABLES;` in MySQL

## Migration from Old System

**Old**: Bearer tokens in localStorage  
**New**: httpOnly cookies

**Old**: In-memory tokens  
**New**: MySQL Session table

No data migration needed. Existing AdminUser passwords remain valid. New `Session` table created automatically.

## Restart Application

After config changes:
1. cPanel → Setup Python App → Restart Application
2. OR touch WSGI: `touch /domains/dcutawala.org/backend-app/passenger_wsgi.py`

## Management Commands

```bash
cd /domains/dcutawala.org/backend-app

# List admins
python init_admin.py list

# Reset password
python admin_manage.py reset admin

# Delete admin
python admin_manage.py delete admin_username
```

## Frontend Pages Using Auth

- `/admin/login` - Login page
- `/admin/layout` - Protected admin shell (all admin pages)
- All `/admin/*` routes require authentication

## API Rate Limiting

Not implemented by default. Add in `admin_auth.py` decorators if needed.
