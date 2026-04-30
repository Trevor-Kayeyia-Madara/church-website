# cPanel Deployment Guide - NO TERMINAL/SSH ACCESS

## All steps use only cPanel web interface (File Manager, UI forms)

---

## ✅ STEP 1: Upload Files via File Manager

1. In cPanel, open **File Manager**
2. Navigate to: `/home/dcutawal/`
3. Click **+ Upload**
4. Upload the entire `deliverance-church-utawala-app` folder (zip it first if needed)
5. Extract: Right-click zip → **Extract** → extract to `/home/dcutawal/`
6. Final path should be: `/home/dcutawal/deliverance-church-utawala-app/`
7. Verify `passenger_wsgi.py` is inside this folder (not nested)

---

## ✅ STEP 2: Create Python App

1. In cPanel, find **Setup Python App** (or **Application Manager**)
2. Click **Create Application**
3. Configure:
   - **Python Version**: 3.11 or 3.12
   - **Application root**: `/home/dcutawal/deliverance-church-utawala-app`
   - **Application startup file**: `passenger_wsgi.py`
   - **Application entry point**: `application`
4. Click **Create**

✅ App now appears in the list. Note the **Application URL** (usually `http://dcutawal.pythonanywhere.com` or similar — we'll fix domain later).

---

## ✅ STEP 3: Install Dependencies (No Terminal)

**Method A: cPanel "Run Pip Install" (Easiest)**

1. In **Setup Python App**, find your app
2. Click **Show python app path** → **Enter** virtualenv
3. You'll see a section: **"Install a module"**
4. In the text box, type: `-r requirements.txt`
5. Click **Install**
6. Wait — it will read all packages from `requirements.txt` and install them

**Method B: File Manager Upload wheel files** (if Method A fails)
- Download packages on your computer
- Upload via File Manager
- Install manually (not recommended)

---

## ✅ STEP 4: Create MySQL Database

1. In cPanel, open **MySQL® Databases**
2. **Create New Database**: name it `church_db`
   - cPanel adds prefix (e.g. `dcutawal_church_db`)
   - Note the full name!
3. **Create New User**:
   - Username: `church_user` (or any)
   - Generate strong password → **Generate** → **Copy** password!
4. **Add User To Database**:
   - Select user + database → **Add**
   - Check **ALL PRIVILEGES**
   - Click **Make Changes**
5. **NOTE FULL DATABASE NAME** (with cPanel prefix)

---

## ✅ STEP 5: Create .env File via File Manager

1. In **File Manager**, go to: `/home/dcutawal/deliverance-church-utawala-app/`
2. Click **+ File** → name it `.env` → **Create**
3. Right-click `.env` → **Edit**
4. Paste content (replace placeholders):

```env
DATABASE_URL=mysql://church_user:YOUR_DB_PASSWORD@localhost:3306/church_db
CORS_ALLOW_ORIGINS=https://dcutawala.org,https://www.dcutawala.org
API_PREFIX=
FRONTEND_DIST_DIR=
YOUTUBE_MAX_RESULTS=50
FLASK_ENV=production
FLASK_DEBUG=0
```

5. **Replace**:
   - `YOUR_DB_PASSWORD` → actual password from Step 4
   - `church_db` → full database name (with cPanel prefix if added)
   - `church_user` → full username (with cPanel prefix if added)

6. Click **Save Changes**

---

## ✅ STEP 6: Create Admin User (via "Execute Python Script")

1. In cPanel → **Setup Python App**
2. Find your app → Click **Show python app path** → **Enter**
3. Look for **"Execute python script"** section
4. In the field, type: `init_admin.py`
5. Click **Run** (or **Execute**)
6. You'll see a text output area — it should prompt for username, email, password
7. Type your choices (each followed by Enter)
8. If it errors, check `.env` exists (Step 5)

**Alternative if "Execute python script" doesn't support interactive input:**

Create a one-time setup script:

**In File Manager → New File** → `setup_admin.py` (in app folder):

```python
import sys
sys.path.insert(0, '/home/dcutawal/deliverance-church-utawala-app')

from app.db import SessionLocal, create_engine
from app.admin_auth import AdminUser, init_admin_db
from app.config import settings
from sqlalchemy import select

# Build engine
engine = create_engine(settings.sqlalchemy_database_url, pool_pre_ping=True, future=True)
init_admin_db(engine)

# Create admin
with SessionLocal() as db:
    admin = AdminUser(
        username='admin',
        email='admin@dcutawala.org',
    )
    admin.set_password('YOUR_SECURE_PASSWORD')
    db.add(admin)
    db.commit()
    print("Admin created: admin / YOUR_SECURE_PASSWORD")
```

1. Save file
2. In cPanel → **Setup Python App** → **Execute python script** → type: `setup_admin.py`
3. Click **Run**
4. Check output — should say "Admin created..."
5. **DELETE** `setup_admin.py` after use (security!)

---

## ✅ STEP 7: Create Subdomain (api.dcutawala.org)

1. In cPanel → **Subdomains**
2. **Subdomain**: `api`
3. **Domain**: `dcutawala.org`
4. **Document Root**: `/home/dcutawal/deliverance-church-utawala-app`
5. Click **Create**

---

## ✅ STEP 8: Wait & Restart App

1. Wait 5–10 minutes for DNS to propagate
2. In **Setup Python App**, find your app
3. Click **Restart Application**
4. Wait ~30 seconds

---

## ✅ STEP 9: Test via Browser

Open these URLs (replace with your actual cPanel assigned URL if different):

### **If api.dcutawala.org is LIVE:**

```
https://api.dcutawala.org/health
```
Expected: `{"ok":true}`

```
https://api.dcutawala.org/api/site
```
Expected: JSON with site settings

```
https://api.dcutawala.org/api/admin/auth/login
```
(Return 401 or error — that's OK; it means route exists)

### **If subdomain not yet propagated**, use the cPanel Application URL:

Find it in **Setup Python App** → your app → **Application URL**

Visit:
```
[Application URL]/health
```

---

## ✅ STEP 10: Install SSL Certificate (HTTPS)

1. In cPanel → **SSL/TLS** → **Manage SSL Sites**
2. Select `api.dcutawala.org`
3. Click **Run AutoSSL**
4. Wait (email notification when ready)
5. After issued, visit `https://api.dcutawala.org/health`

---

## ✅ STEP 11: Configure Frontend

In your frontend cPanel hosting (main domain):

**File Manager** → edit frontend `.env` file (or env vars in hosting platform):

```env
NEXT_PUBLIC_BACKEND_URL=https://api.dcutawala.org
```

Rebuild frontend if needed.

---

## 🔍 Troubleshooting (No Terminal)

### **500 Internal Server Error**

1. In cPanel → **Metrics** → **Errors**
2. Scroll to recent errors
3. Look for:
   - `ModuleNotFoundError` → dependencies not installed (go to Step 3)
   - `ImportError` → file missing or wrong path
   - `Database connection` → check `.env` DATABASE_URL format

**Fix ModuleNotFound via cPanel UI:**
- Setup Python App → Show python app path → Enter
- Use "Install a module" → type package name (e.g., `Flask==3.0.3`) → Install one by one
- OR type `-r /home/dcutawal/deliverance-church-utawala-app/requirements.txt`

---

### **"ImportError: cannot import name 'AdminUser'"**

1. File Manager → navigate to `app/`
2. Confirm `admin_auth.py` exists
3. Right-click → **Permissions** → set to `644`
4. Do same for all `.py` files: select all → **Permissions** → `644`

---

### **Database Connection Error**

1. Double-check `.env` DATABASE_URL:
   - Username: includes cPanel prefix if any (e.g. `dcutawal_church_user`)
   - Password: exact from Step 4
   - Database: exact name from Step 4
   - Host: `localhost`
2. MySQL Databases → Confirm user has **ALL PRIVILEGES** on that DB

---

### **App not restarting**

1. In **Setup Python App**, click **Restart Application**
2. If still fails, click **Delete Application** and **recreate** (Step 2) — paths unchanged

---

## 📋 QUICK CHECKLIST

- [ ] Files uploaded to `/home/dcutawal/deliverance-church-utawala-app/`
- [ ] Python App created: root=`...deliverance-church-utawala-app`, startup=`passenger_wsgi.py`, entry=`application`
- [ ] Dependencies installed via "Install a module" using `-r requirements.txt`
- [ ] MySQL DB created (`church_db` + user with password)
- [ ] `.env` file created with `DATABASE_URL` (correct username/password/db)
- [ ] Admin user created (via Execute python script → `init_admin.py`)
- [ ] Subdomain `api.dcutawala.org` → Document root: `/home/dcutawal/deliverance-church-utawala-app`
- [ ] SSL installed via AutoSSL
- [ ] `https://api.dcutawala.org/health` → returns `{"ok":true}`
- [ ] Admin login test returns token
- [ ] Frontend `NEXT_PUBLIC_BACKEND_URL` set to `https://api.dcutawala.org`

---

## 🎯 After Backend Works

1. Build frontend locally: `cd frontend && npm run build`
2. Upload `frontend/dist/` to cPanel (public_html or subdomain `dcutawala.org`)
3. Set frontend env variable to point to backend
4. Test full site: `https://dcutawala.org`

---

**All steps avoid terminal/SSH. Use File Manager, Setup Python App UI, MySQL Databases, Subdomains, and SSL/TLS.**
