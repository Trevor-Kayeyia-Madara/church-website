# cPanel Deployment Without Terminal Access

If you cannot use cPanel Terminal/SSH, you can still deploy the Django backend using only cPanel File Manager and the Python App UI.

## 1. Upload Backend Files via File Manager

1. Open cPanel → **File Manager**.
2. Navigate to `/home/username/public_html/` or your preferred web root.
3. Upload the `backend/` folder as a ZIP archive.
4. After upload, right-click the ZIP and choose **Extract**.
5. Confirm the extracted files include: `manage.py`, `requirements.txt`, `.env`, `backend/`, `apps/`, `public/`.

## 2. Create the Python App in cPanel UI

1. Go to cPanel → **Setup Python App**.
2. Click **Create Application**.
3. Configure:
   - Python version: `3.11` or `3.12`
   - Application root: `/home/username/public_html/backend`
   - Application startup file: `backend/wsgi.py`
   - Application entry point: `application`
   - Application URL: your API domain or subdomain
4. Click **Create**.

This setup will create the virtual environment automatically.

## 3. Install Python Packages Without Terminal

### Option A: Use cPanel's Python App UI package installer

Some cPanel installations let you install packages directly from the Python App interface.

1. Open the Python App you created.
2. Look for a package install field or a button to install dependencies.
3. Install from `requirements.txt` if supported, or add packages manually:
   - `Django==5.1`
   - `djangorestframework==3.15.2`
   - `django-cors-headers==4.4.0`
   - `mysqlclient==2.2.4`
   - `Pillow==10.4.0`
   - `python-dotenv==1.0.1`

### Option B: Upload a prebuilt `venv/`

If the UI cannot install packages, you can upload a local virtual environment.

1. On your local machine, create a Python venv and install requirements.
2. Zip the `venv/` folder.
3. Upload `venv.zip` into `/home/username/public_html/backend/`.
4. Extract it in File Manager.
5. Make sure the Python App points to the existing `venv/` directory.

> Note: Uploading a full `venv/` can be large, but it avoids terminal commands.

## 4. Configure `.env` in File Manager

1. Open `/home/username/public_html/backend/.env` in File Manager.
2. Set database values from cPanel MySQL Databases:

```env
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=3306
```

3. Set CORS origins to your frontend domain:

```env
CORS_ALLOWED_ORIGINS=https://yourfrontend.com,https://www.yourfrontend.com
```

4. Set a strong setup token:

```env
ADMIN_SETUP_TOKEN=replace-with-a-strong-secret
```

5. For production, set:

```env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## 5. Create the First Admin User Without Terminal

This backend includes a one-time setup endpoint for creating the first superuser.

### Use this endpoint only once:

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

If successful, it returns:
```json
{"ok": true, "user": {"id": 1, "username": "admin", "email": "admin@example.com"}}
```

### If you cannot call this endpoint
If you cannot access the app yet, ask your hosting provider to run the first admin creation command for you:

```bash
cd /home/username/public_html/backend
source venv/bin/activate
python manage.py createsuperuser
```

## 6. Restart the Python App in cPanel

Once `.env` is configured and packages are installed, use cPanel UI:

- cPanel → **Setup Python App**
- Find your app
- Click **Restart**

## 7. Test the Deployment

1. Open `https://your-api-domain.com/admin/` and verify the Django admin login page.
2. Call `GET /api/admin/auth/me` to confirm the backend is reachable.
3. Use login endpoint if needed:

```http
POST /api/admin/auth/login
Content-Type: application/json
```

Body:
```json
{ "username": "admin", "password": "StrongPassword123!" }
```

## 8. Notes

- If your cPanel UI cannot install Python packages, the only remaining option is upload a working `venv/` or ask host support.
- After you create the first admin, remove or unset `ADMIN_SETUP_TOKEN` from `.env`.
- If `DEBUG=True`, only use this during initial setup; switch to `DEBUG=False` after deployment.
