# QUICK START - cPanel Deployment (api.dcutawala.org)

## TL;DR - Copy & Paste Commands

### 1. Terminal Commands (cPanel SSH)
```bash
# Navigate to your app
cd /home/dcutawal/deliverance-church-utawala-app

# Activate virtualenv
source /home/dcutawal/virtualenv/deliverance-church-utawala-app/3.11/bin/activate

# Install packages
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=mysql://church_user:YOUR_PASSWORD@localhost:3306/church_db
CORS_ALLOW_ORIGINS=https://dcutawala.org,https://www.dcutawala.org
API_PREFIX=
YOUTUBE_MAX_RESULTS=50
EOF

# Create admin user
python init_admin.py create

# Test app
python -c "from app.app import create_app; print('OK')"
```

### 2. cPanel UI Steps

**Setup Python App:**
- Application root: `/home/dcutawal/deliverance-church-utawala-app`
- Startup file: `passenger_wsgi.py`
- Entry point: `application`

**Subdomains:**
- Create `api.dcutawala.org` → document root = `/home/dcutawal/deliverance-church-utawala-app`

**MySQL Databases:**
1. Create DB: `church_db`
2. Create user: `church_user` + password
3. Add user to DB with ALL PRIVILEGES
4. Update `.env` with correct password

### 3. Test URLs

| URL | Expected |
|-----|---------|
| `https://api.dcutawala.org/health` | `{"ok":true}` |
| `https://api.dcutawala.org/api/site` | JSON with site settings |
| `https://api.dcutawala.org/api/admin/auth/login` | 401 (needs POST) |

### 4. Create Admin (if needed)
```bash
cd /home/dcutawal/deliverance-church-utawala-app
source /home/dcutawal/virtualenv/deliverance-church-utawala-app/3.11/bin/activate
python init_admin.py create
```

---

## Key Paths

| What | Path |
|------|------|
| App directory | `/home/dcutawal/deliverance-church-utawala-app/` |
| Virtualenv | `/home/dcutawal/virtualenv/deliverance-church-utawala-app/3.11/` |
| passenger_wsgi.py | `/home/dcutawal/deliverance-church-utawala-app/passenger_wsgi.py` |
| .env file | `/home/dcutawal/deliverance-church-utawala-app/.env` |
| Error logs | `/home/dcutawal/logs/error_log` |
| Passenger logs | `/home/dcutawal/logs/passenger.log` (if configured) |

---

## Common Commands

```bash
# Restart app (after config changes)
touch /home/dcutawal/deliverance-church-utawala-app/passenger_wsgi.py

# View logs
tail -f /home/dcutawal/logs/error_log

# Check Python version
python --version

# List installed packages
pip list

# Reinstall all deps
pip install -r requirements.txt --force-reinstall

# Test import
python -c "from app.app import create_app; app = create_app(); print('Flask loaded OK')"

# Create admin
python init_admin.py create
python init_admin.py list
python init_admin.py reset admin
```

---

## Checklist Before Going Live

- [ ] Database created (`church_db`)
- [ ] User created (`church_user`) with privileges
- [ ] `.env` file with correct `DATABASE_URL`
- [ ] `init_admin.py create` ran successfully
- [ ] `api.dcutawala.org` subdomain → `/home/dcutawal/deliverance-church-utawala-app`
- [ ] Passenger app created in cPanel UI
- [ ] SSL certificate installed (AutoSSL)
- [ ] `https://api.dcutawala.org/health` returns `{"ok":true}`
- [ ] Admin login works (POST `/api/admin/auth/login`)
- [ ] Frontend `NEXT_PUBLIC_BACKEND_URL` set to `https://api.dcutawala.org`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 500 Error | Check `/home/dcutawal/logs/error_log` |
| ModuleNotFound | `pip install -r requirements.txt` in virtualenv |
| DB connection failed | Verify DB credentials in `.env`, user has privileges |
| ImportError | Check file paths, ensure `passenger_wsgi.py` at app root |
| Permission denied | `chmod 644 passenger_wsgi.py`, `chmod -R 755 app/` |
| White screen | Check `error_log`, ensure `.env` exists |

---

## After Backend Works

1. Build frontend: `cd frontend && npm run build`
2. Deploy frontend to cPanel (public_html or subdomain)
3. Set frontend env: `NEXT_PUBLIC_BACKEND_URL=https://api.dcutawala.org`
4. Test: visit `https://dcutawala.org` and check network tab for API calls
5. Update production `.env` with real YouTube API keys if needed
