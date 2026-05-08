# cPanel Deployment - Step-by-Step Visual Guide

## Stage 1: Prepare Your Environment (Local)

### Create ZIP for Upload
```bash
# On your local machine, in project root:
cd deliverance-church-utawala-app
zip -r backend.zip backend/ -x "backend/.git/*" "backend/__pycache__/*" "backend/venv/*"
```

This creates `backend.zip` (~10-20MB) to upload to cPanel.

---

## Stage 2: cPanel Setup

### A. Upload Files

**Option 1: File Manager (Easy)**
1. cPanel Home → **File Manager**
2. Navigate to `/home/username/public_html/`
3. Click **Upload** (top)
4. Select `backend.zip`
5. Wait for upload to complete
6. Right-click `backend.zip` → **Extract**
7. Delete `backend.zip` after extraction

**Option 2: FTP (Manual)**
1. Use FileZilla, WinSCP, or similar
2. Connect with cPanel FTP credentials
3. Upload `backend/` folder to `/home/username/public_html/backend/`

Result:
```
/home/username/public_html/
└── backend/
    ├── manage.py
    ├── requirements.txt
    ├── .env
    ├── setup.sh
    ├── backend/
    ├── apps/
    └── public/
```

---

### B. Create Python Application

1. **Go to cPanel Home**
2. **Scroll to Software section**
3. Click **Setup Python App**

   ![Note: You should see a button labeled "Setup Python App"]

4. Click **+ Create Application**

5. **Fill in the form:**
   
   | Field | Value |
   |-------|-------|
   | Python version | 3.11 or 3.12 |
   | Application root | `/home/username/public_html/backend` |
   | Application startup file | `backend/wsgi.py` |
   | Application entry point | `application` |
   | Application URL | `https://api.yourdomain.com` or `https://yourdomain.com/api` |

6. Click **Create**

   cPanel will automatically:
   - Create `venv/` virtual environment
   - Set up Passenger (WSGI server)
   - Configure environment

---

### C. Configure MySQL Database

1. cPanel Home → **MySQL Databases**

2. **Create Database:**
   - Enter name: `church_db`
   - Click **Create Database**

3. **Create MySQL User:**
   - Username: `church_user`
   - Password: (strong password with uppercase, numbers, symbols)
   - Click **Create User**

4. **Add User to Database:**
   - Select user `church_user`
   - Select database `church_db`
   - Click **Add**
   - Check ALL PRIVILEGES
   - Click **Make Changes**

5. **Copy credentials:**
   - Database: `church_db`
   - User: `church_user`
   - Password: (your generated password)
   - Host: `localhost`

---

## Stage 3: Backend Configuration

### A. Edit .env File

1. **cPanel File Manager** → navigate to `/home/username/public_html/backend/`
2. Find `.env` file
3. Right-click → **Edit**
4. Update values:

```env
# Django settings
SECRET_KEY=django-insecure-your-key  # Keep for now, change later
DEBUG=True                            # Change to False in production
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database credentials
DB_NAME=church_db
DB_USER=church_user
DB_PASSWORD=YourPasswordHere
DB_HOST=localhost
DB_PORT=3306

# Frontend domain
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

5. Click **Save Changes**

### B. Run Setup Script

1. **cPanel → Terminal** (or SSH)

2. **Navigate and run:**
```bash
cd /home/username/public_html/backend
bash setup.sh
```

   This will:
   - Create upload directories
   - Install Python packages
   - Run database migrations
   - Collect static files

3. **Create Admin User:**
```bash
python manage.py createsuperuser
```

   Enter:
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: (strong password)
   - Confirm password

---

## Stage 4: Deployment

### A. Restart Python App

1. **cPanel Home → Setup Python App**
2. Find your application
3. Click **Restart**
4. Wait 30-60 seconds

---

## Stage 5: Verification

### Test API Endpoints

**Option 1: Browser**
1. Visit: `https://api.yourdomain.com/admin/`
2. Login with admin credentials
3. You should see Django admin panel

**Option 2: Postman/curl**

```bash
# Test login
curl -X POST https://api.yourdomain.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'

# Response should be:
# {"ok":true,"user":{"id":1,"username":"admin","email":"admin@example.com"}}
```

**Option 3: Check app is running**
```bash
curl -I https://api.yourdomain.com/api/admin/auth/me

# Should return 200 or 401 (not 502/503)
```

---

## Stage 6: Frontend Integration

### Update Frontend .env

In `/frontend/.env`:
```env
VITE_API_URL=https://api.yourdomain.com
```

### Update Frontend Code

In `/frontend/src/lib/adminAuth.server.jsx` and API calls:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Login example
const response = await fetch(`${API_URL}/api/admin/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
  credentials: 'include'
})
```

### Build and Deploy Frontend

```bash
cd frontend
npm run build

# Upload dist/ folder to /home/username/public_html/
# Or configure cPanel to serve from dist/
```

---

## Troubleshooting

### Issue: 502 Bad Gateway

**Solution:**
```bash
# Via cPanel Terminal:
cd /home/username/public_html/backend
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput

# Then in cPanel: Setup Python App → Restart
```

### Issue: "No module named 'django'"

**Solution:**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Database Connection Error

**Solution:**
```bash
# Verify .env has correct credentials
# Test connection:
mysql -u church_user -p -h localhost church_db
# Enter password when prompted

# If can't connect, check:
# 1. Database exists: cPanel → MySQL Databases
# 2. User exists and has privileges
# 3. Host is "localhost"
```

### Issue: "Permission Denied" on Uploads

**Solution:**
```bash
chmod 755 public/uploads -R
chmod 644 public/uploads/*/*  # For files inside
```

### Issue: Static Files Not Showing (404)

**Solution:**
```bash
python manage.py collectstatic --noinput --clear
```

### Issue: CORS Errors in Frontend

**Solution:**
```env
# Update .env CORS settings:
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com

# Then restart app in cPanel
```

---

## Production Checklist

- [ ] SSH/Terminal access working
- [ ] Files uploaded to `/home/username/public_html/backend/`
- [ ] Python app created in cPanel
- [ ] `.env` configured with MySQL credentials
- [ ] `setup.sh` completed without errors
- [ ] Admin user created
- [ ] App restarted in cPanel
- [ ] Admin panel accessible at `/admin/`
- [ ] API endpoints return correct responses
- [ ] Frontend configured with correct API URL
- [ ] Frontend built and deployed
- [ ] SSL certificate active (AutoSSL)
- [ ] Backups configured in cPanel

---

## Useful cPanel Commands (Terminal)

```bash
# Check if Python app is running
ps aux | grep python

# View recent errors
tail -30 /home/username/logs/error_log

# Restart Apache/Passenger
systemctl restart httpd

# Check disk space
df -h

# Database backup
mysqldump -u church_user -p church_db > backup.sql

# View file permissions
ls -la /home/username/public_html/backend/
```

---

## Support & Additional Resources

- **cPanel Docs:** https://docs.cpanel.net/
- **Django Docs:** https://docs.djangoproject.com/
- **Passenger Docs:** https://www.phusionpassenger.com/docs/
- **MySQL Docs:** https://dev.mysql.com/doc/

For hosting support, contact your cPanel provider.
