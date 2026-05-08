#!/bin/bash
# cPanel Django Health Check Script
# Run this after deployment to verify everything works

echo "=========================================="
echo "  Django cPanel Health Check"
echo "=========================================="
echo ""

source venv/bin/activate

echo "[1/5] Checking Django installation..."
if python -c "import django; print(django.VERSION)" > /dev/null 2>&1; then
    VERSION=$(python -c "import django; print(django.get_version())")
    echo "      ✓ Django $VERSION installed"
else
    echo "      ✗ Django not found!"
    exit 1
fi
echo ""

echo "[2/5] Checking database connection..."
if python manage.py dbshell <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "      ✓ Database connected"
else
    echo "      ✗ Database connection failed!"
    echo "      Check .env credentials: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST"
    exit 1
fi
echo ""

echo "[3/5] Checking migrations..."
if python manage.py migrate --check > /dev/null 2>&1; then
    echo "      ✓ All migrations applied"
else
    echo "      ! Unapplied migrations detected"
    echo "        Run: python manage.py migrate"
fi
echo ""

echo "[4/5] Checking admin user..."
ADMIN_COUNT=$(python manage.py shell -c "from django.contrib.auth.models import User; print(User.objects.filter(is_staff=True).count())")
if [ "$ADMIN_COUNT" -gt 0 ]; then
    echo "      ✓ $ADMIN_COUNT admin user(s) found"
else
    echo "      ✗ No admin users found!"
    echo "        Create with: python manage.py createsuperuser"
fi
echo ""

echo "[5/5] Checking required apps..."
APPS_CHECK=$(python manage.py shell -c "
from django.apps import apps
required = ['rest_framework', 'corsheaders', 'apps.admin_app']
for app in required:
    if apps.is_installed(app):
        print(f'✓ {app}')
    else:
        print(f'✗ {app}')
")
echo "$APPS_CHECK"
echo ""

echo "=========================================="
echo "  Health Check Complete"
echo "=========================================="
echo ""

echo "API Endpoints to test:"
echo "  GET  /api/admin/auth/me"
echo "  POST /api/admin/auth/login"
echo ""
echo "Admin Panel: /admin/"
echo ""
