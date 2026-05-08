# cPanel Django Quick Start Guide (Summary)

## Quick 5-Step Setup for cPanel

### STEP 1: Upload Backend Files
```
File Manager or FTP:
- Upload /backend folder to /home/username/public_html/backend/
- Folder should contain: manage.py, requirements.txt, .env, backend/, apps/
```

### STEP 2: Create Python App in cPanel
```
cPanel Home → Setup Python App → Create Application

Settings:
- Python version: 3.11 or 3.12
- Application root: /home/username/public_html/backend
- Application startup file: backend/wsgi.py
- Application entry point: application
- Application URL: https://api.yourdomain.com (or your subdomain)

Click CREATE
```

### STEP 3: Install Dependencies
```bash
# Via cPanel Terminal/SSH:

cd /home/username/public_html/backend
source venv/bin/activate
pip install -r requirements.txt
```

### STEP 4: Run Setup
```bash
# Via cPanel Terminal:

cd /home/username/public_html/backend
source venv/bin/activate
bash setup.sh

# Then create admin user:
python manage.py createsuperuser
```

### STEP 5: Restart & Test
```
cPanel → Setup Python App → [Your App] → RESTART

Test:
- Admin panel: https://api.yourdomain.com/admin/
- API test: https://api.yourdomain.com/api/admin/auth/me
```

---

## What You Need From cPanel

1. **MySQL Database:**
   - Go to cPanel → MySQL Databases
   - Create database: `church_db`
   - Create user: `church_user` with password
   - Add user to database with ALL privileges
   - Note: username, password, database name

2. **Update .env file:**
   ```env
   DB_NAME=church_db           # Your database name
   DB_USER=church_user         # Your MySQL user
   DB_PASSWORD=YourPassword    # Your MySQL password
   DB_HOST=localhost           # Usually localhost
   ```

3. **Update CORS:**
   ```env
   CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

---

## API Endpoints Ready

Once deployed, these endpoints work:

```
POST   /api/admin/auth/login           → Login
POST   /api/admin/auth/logout          → Logout
GET    /api/admin/auth/me              → Check auth

GET    /api/admin/pastors/             → List pastors
POST   /api/admin/pastors/             → Create pastor
PUT    /api/admin/pastors/{id}/        → Update pastor
DELETE /api/admin/pastors/{id}/        → Delete pastor

POST   /api/admin/upload/pastor-photo  → Upload pastor image
POST   /api/admin/upload/sermon-thumb  → Upload sermon thumbnail
POST   /api/admin/upload/event-poster  → Upload event image
POST   /api/admin/upload/gallery       → Upload gallery image

Similar endpoints for: sermons/, events/, ministries/, messages/, gallery/, settings/
```

---

## Troubleshooting Quick Fixes

**502 Bad Gateway?**
```bash
# In cPanel Terminal:
source venv/bin/activate
python manage.py migrate
# Then RESTART app in cPanel
```

**"No module named django"?**
```bash
cd /home/username/public_html/backend
source venv/bin/activate
pip install -r requirements.txt
```

**Database error?**
```bash
# Check .env has correct DB credentials
# Verify database exists in cPanel → MySQL Databases
```

**Upload folder permission denied?**
```bash
chmod 755 public/uploads -R
```

---

## Full Documentation

See: `CPANEL_SETUP.md` in backend folder for detailed instructions.
