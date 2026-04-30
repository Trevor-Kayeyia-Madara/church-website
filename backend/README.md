# Backend (Flask) - Deliverance Church Utawala

This backend is WSGI-friendly for typical cPanel Python hosting.

## Quick Start (Local Development)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # Windows
# or: source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
set FLASK_APP=app.app:app  # Windows
# or: export FLASK_APP=app.app:app  # Mac/Linux
flask run --port 8000
```

Or with a production server (recommended):

```bash
pip install waitress
python -c "from waitress import serve; from app.app import app; serve(app, host='127.0.0.1', port=8000)"
```

## Environment Variables

Create `.env` file (copy from `.env.example`):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL URL: `mysql://user:pass@host:3306/church_db` |
| `CORS_ALLOW_ORIGINS` | Comma-separated origins or `*` for all |
| `API_PREFIX` | Optional URL prefix (e.g., `/api`) |
| `FRONTEND_DIST_DIR` | Path to built frontend (optional, for serving SPA) |
| `YOUTUBE_API_KEY` | YouTube Data API key (optional) |
| `YOUTUBE_PLAYLIST_ID` | YouTube playlist ID (optional) |
| `YOUTUBE_CHANNEL_ID` | YouTube channel ID (optional) |
| `YOUTUBE_MAX_RESULTS` | Max videos to fetch (default: 50) |

## cPanel Deployment (api.dcutawala.org)

### Step 1: Create Python App in cPanel

1. Log into cPanel → **Setup Python App**
2. Click **Create Application**
3. Configure:
   - **Python Version**: 3.11 or 3.12
   - **Application root**: `/home/username/backend` (or `/home/username/api` — your preference)
   - **Application startup file**: `passenger_wsgi.py`
   - **Application entry point**: `application`
4. Click **Create**

### Step 2: Install Dependencies

In cPanel, open **Terminal** (SSH access) or use **Setup Python App → Show python app path → Enter virtualenv**:

```bash
# Navigate to your app directory
cd ~/backend  # or wherever you set Application root

# Install requirements
pip install -r requirements.txt
```

### Step 3: Configure Environment

In cPanel **Setup Python App**, click **Show python app path** → **Enter** virtualenv, then:

```bash
# Create .env file
nano ~/backend/.env
```

Add:
```env
DATABASE_URL=mysql://church_user:secure_password@localhost:3306/church_db
CORS_ALLOW_ORIGINS=https://dcutawala.org,https://www.dcutawala.org,http://localhost:3000
API_PREFIX=
FRONTEND_DIST_DIR=../frontend/dist
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTube_MAX_RESULTS=50
```

Save (`Ctrl+X`, `Y`, `Enter`).

### Step 4: Initialize Database

The backend uses SQLAlchemy to auto-create tables, but you must initialize the admin user:

```bash
cd ~/backend
python init_admin.py create
```

Follow prompts to create username, email, password.

**Optional**: Manage admins later:
```bash
python init_admin.py list
python init_admin.py reset admin_username
python init_admin.py delete admin_username
```

### Step 5: Database Setup

If your database doesn't exist yet, create it:

1. In cPanel → **MySQL® Databases**
2. Create database: `church_db`
3. Create user: `church_user` with strong password
4. Add user to database with **ALL PRIVILEGES**
5. Update `DATABASE_URL` in `.env` with these credentials

### Step 6: Point Domain to App

Your backend should be accessible at: `http://api.dcutawala.org/`

In cPanel:

**Option A: Subdomain pointing to passenger_wsgi.py**
1. cPanel → **Subdomains**
2. Create subdomain: `api` (domain: `dcutawala.org`)
3. Document Root: `/home/username/backend` (or wherever your `passenger_wsgi.py` lives)
4. Ensure ** Passenger** is enabled for this subdomain

**Option B: Addon domain or redirect**
- If `api.dcutawala.org` is a separate DNS record pointing to your cPanel server, Passenger should auto-detect `passenger_wsgi.py` in the document root.

### Step 7: Verify Installation

Test endpoints:

```bash
# Health check
curl http://api.dcutawala.org/health

# API root (should return 404 if no SPA, or index.html if frontend served)
curl http://api.dcutawala.org/

# Admin login (after creating admin)
curl -X POST http://api.dcutawala.org/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

Expected health response:
```json
{"ok":true}
```

### Step 8: Configure Frontend to Call Backend

In your frontend `.env` (or hosting config), set:

```env
NEXT_PUBLIC_BACKEND_URL=https://api.dcutawala.org
```

Update frontend API calls to use this base URL.

### cPanel-Specific Notes

**Passenger Logs**: Check error logs in cPanel → **Metrics** → **Errors** or:
```
~/backend/passenger.log
~/logs/error_log
```

**Python Path Issues**: If imports fail, ensure the virtualenv is correctly activated in the **Setup Python App** interface.

**Restart App**: After config changes, restart via:
- cPanel → **Setup Python App** → **Restart Application**

**File Permissions**: Ensure `passenger_wsgi.py` is readable by the web server (644 permissions).

### Production Security Checklist

- [ ] Change default admin username/password immediately after setup
- [ ] Use HTTPS (SSL certificate via cPanel → SSL/TLS)
- [ ] Set strong database password
- [ ] Restrict `CORS_ALLOW_ORIGINS` to your domain(s), not `*`
- [ ] Consider implementing rate limiting on admin auth endpoints
- [ ] Change SQLAlchemy echo settings for production (currently silent)
- [ ] Enable `X-Forwarded-Proto` handling if behind proxy (cPanel handles)

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **500 Internal Server Error** | Check cPanel error logs. Common causes: missing modules, import errors |
| **ModuleNotFoundError** | Ensure all packages installed in virtualenv (`pip install -r requirements.txt`) |
| **Database connection failed** | Verify `DATABASE_URL` and that MySQL user has privileges |
| **Cannot import 'app'** | Ensure `Application startup file` is `passenger_wsgi.py` and `Application entry point` is `application` |
| **Static files not found** | If serving frontend from backend, ensure `FRONTEND_DIST_DIR` path is correct absolute or relative to `backend/` |
| **Admin login fails** | Run `python init_admin.py create` to ensure admin table exists and user is created |

### File Structure

```
backend/
├── passenger_wsgi.py    # WSGI entry point for Passenger/cPanel
├── app/
│   ├── app.py          # Flask app factory + routes
│   ├── admin_routes.py # Admin dashboard CRUD endpoints
│   ├── admin_auth.py   # Auth model + decorator
│   ├── config.py       # Settings / env vars
│   ├── db.py           # SQLAlchemy engine + session
│   ├── models.py       # SQLAlchemy models
│   ├── youtube.py      # YouTube API integration
│   ├── defaults.py     # Default site data
│   └── wsgi.py         # Alternative WSGI entry
├── requirements.txt    # Python dependencies
├── .env.example       # Environment template
├── init_admin.py      # Init script (creates admin tables)
├── admin_manage.py    # Admin user management
└── README.md          # This file
```

### API Documentation

- **Public API**: See main `README.md` (sermons, events, pastors, ministries, contact)
- **Admin API**: See `ADMIN_API.md` (authenticated content management)

### Management Commands (cPanel Terminal)

```bash
# Create admin user (first time)
python init_admin.py create

# List admin users
python init_admin.py list

# Reset admin password
python init_admin.py reset admin

# Delete admin user
python init_admin.py delete admin

# Test Flask app locally
flask run --port=8000
```

### Domain Configuration

**API Base URL**: `https://api.dcutawala.org`
**Health endpoint**: `https://api.dcutawala.org/health`
**Site settings**: `https://api.dcutawala.org/api/site`
**CORS**: Configure `CORS_ALLOW_ORIGINS` to include your frontend domain.

**DNS**: Ensure `api.dcutawala.org` A record points to your cPanel server IP.

