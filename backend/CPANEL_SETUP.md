# Django cPanel Deployment Guide

## Prerequisites
- cPanel access with Terminal/SSH enabled
- Python 3.9+ installed on server
- MySQL database created
- Domain/subdomain configured

---

## Step 1: Upload Backend Files to cPanel

### Via File Manager:
1. Go to cPanel → **File Manager**
2. Navigate to `/home/username/public_html/` (or create `/home/username/api/`)
3. Upload the `backend/` folder (compress as ZIP first to save time)
4. Extract the ZIP file in cPanel

### Via FTP:
1. Use FileZilla or similar FTP client
2. Connect with cPanel credentials
3. Upload entire `backend/` directory to `/home/username/public_html/backend/`

### Folder Structure After Upload:
```
/home/username/public_html/backend/
├── manage.py
├── requirements.txt
├── .env
├── backend/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   └── admin_app/
│       ├── models.py
│       ├── views.py
│       ├── urls.py
│       └── ...
└── public/
    └── uploads/
```

---

## Step 2: Create Python Application in cPanel

### Method A: Using cPanel UI (Recommended)

1. **Go to cPanel Home**
2. Click **Setup Python App** (under Software section)
3. Click **Create Application**
4. Configure:
   - **Python version**: 3.11 or 3.12
   - **Application root**: `/home/username/public_html/backend`
   - **Application startup file**: `backend/wsgi.py`
   - **Application entry point**: `application`
   - **Application URL**: `https://api.yourdomain.com` (or subdomain)

5. Click **Create**

cPanel will:
- Create a virtual environment automatically
- Set up Passenger (WSGI server)
- Generate configuration files

---

## Step 3: Install Python Dependencies

### Via cPanel Terminal:

1. **SSH/Terminal into cPanel**
   - Go to cPanel → **Terminal** (or SSH with your credentials)

2. **Navigate to backend directory**
   ```bash
   cd /home/username/public_html/backend
   ```

3. **Activate virtual environment**
   ```bash
   source /home/username/public_html/backend/venv/bin/activate
   ```
   (cPanel creates `venv/` automatically)

4. **Install requirements**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

   This installs:
   - Django==5.1
   - djangorestframework==3.15.2
   - django-cors-headers==4.4.0
   - mysqlclient==2.2.4
   - Pillow==10.4.0
   - python-dotenv==1.0.1

5. **Verify installation**
   ```bash
   python -m django --version
   ```

---

## Step 4: Configure Environment Variables

1. **Edit `.env` file** in `/home/username/public_html/backend/.env`

2. **Update MySQL credentials:**
   ```env
   DB_NAME=your_database_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=3306
   ```

3. **Update CORS** (set to your domain):
   ```env
   CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

4. **For Production** (important):
   ```env
   SECRET_KEY=generate-a-secure-random-key-here
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
   ```

---

## Step 5: Initialize Database & Create Admin User

### In Terminal:

1. **Run migrations**
   ```bash
   cd /home/username/public_html/backend
   source venv/bin/activate
   python manage.py migrate
   ```

2. **Create superuser (admin account)**
   ```bash
   python manage.py createsuperuser
   ```
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `(secure password)`

3. **Collect static files** (for production)
   ```bash
   python manage.py collectstatic --noinput
   ```

### Without Terminal Access

If your cPanel account does not provide Terminal or SSH access, use the no-terminal setup guide in `CPANEL_NO_TERMINAL.md`.

This Django backend exposes a one-time endpoint for initial admin creation:

```http
POST /api/admin/auth/setup-admin
Content-Type: application/json
X-ADMIN-SETUP-TOKEN: your-token-here
```

Body:

```json
{
  "username": "admin",
  "password": "StrongPassword123!",
  "email": "admin@example.com"
}
```

Make sure `ADMIN_SETUP_TOKEN` is set in `.env` before calling this endpoint. After creating the first admin, remove or unset `ADMIN_SETUP_TOKEN`.
---

## Step 6: Restart Python App in cPanel

1. Go to cPanel → **Setup Python App**
2. Find your application
3. Click **Restart** button
4. Wait 30 seconds for restart

---

## Step 7: Configure File Permissions

In Terminal:

```bash
cd /home/username/public_html/backend

# Ensure uploads directory exists and is writable
mkdir -p public/uploads/pastors
mkdir -p public/uploads/sermons
mkdir -p public/uploads/events
mkdir -p public/uploads/gallery

# Set permissions
chmod 755 public/uploads
chmod 755 public/uploads/pastors
chmod 755 public/uploads/sermons
chmod 755 public/uploads/events
chmod 755 public/uploads/gallery
```

---

## Step 8: Test the API

### Test endpoints:

```bash
# Test login
curl -X POST https://api.yourdomain.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'

# Test health check (if added)
curl https://api.yourdomain.com/api/admin/auth/me
```

Or use **Postman** to test APIs.

---

## Step 9: Configure Nginx/Apache for Static Files & Media

### If using Nginx:

Create `/home/username/public_html/backend/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /api/
    
    # Serve media files directly
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^uploads/ - [L]
    
    # Route everything else to Django
    RewriteRule ^(.*)$ wsgi.py [QSA,L]
</IfModule>
```

---

## Step 10: Point Frontend to Backend API

In frontend code (`.env` or `config.js`):

```javascript
REACT_APP_API_URL=https://api.yourdomain.com
```

Update API calls:
```javascript
const response = await fetch('https://api.yourdomain.com/api/admin/auth/login', {
  method: 'POST',
  body: JSON.stringify({username, password})
})
```

---

## Troubleshooting

### 502 Bad Gateway Error
```bash
# Check error logs
tail -f /home/username/logs/error_log
tail -f /home/username/logs/access_log

# Restart app
cPanel → Setup Python App → Restart
```

### Database Connection Error
```bash
# Verify database credentials in .env
# Test MySQL connection
mysql -u DB_USER -p DB_PASSWORD -h localhost DB_NAME

# Run migrations again
python manage.py migrate
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check Python version
python --version
```

### Permission Denied on Uploads
```bash
chmod 777 public/uploads -R
```

---

## Deployment Checklist

- [ ] Files uploaded to cPanel
- [ ] Python app created in cPanel
- [ ] Dependencies installed
- [ ] `.env` configured with database credentials
- [ ] Migrations run successfully
- [ ] Admin user created
- [ ] Static files collected
- [ ] File permissions set (755 for directories, 644 for files)
- [ ] API endpoints tested with Postman/curl
- [ ] Frontend configured to use correct API URL
- [ ] CORS settings match frontend domain
- [ ] SSL certificate installed
- [ ] Email notifications enabled in cPanel

---

## Useful cPanel Commands

```bash
# View Python app status
ps aux | grep python

# Check if Django app is running
curl -I https://api.yourdomain.com/api/admin/auth/me

# View recent errors
tail -20 /home/username/logs/error_log

# Monitor app
watch -n 5 'ps aux | grep python'
```

---

## Next Steps

1. Upload frontend `dist/` folder to `/home/username/public_html/`
2. Configure domain SSL certificate (free via AutoSSL in cPanel)
3. Set up email notifications
4. Monitor API usage and performance
5. Regular database backups

For additional help: Contact your hosting provider's support team.
