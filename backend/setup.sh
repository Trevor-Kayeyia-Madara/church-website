#!/bin/bash
# cPanel Django Setup Script
# Run this from: /home/username/public_html/backend/
# Usage: bash setup.sh

set -e  # Exit on error

echo "=========================================="
echo "  Django cPanel Setup Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "[ERROR] .env file not found!"
    echo "Please create .env file with database credentials first."
    exit 1
fi

echo "[1/5] Creating directories..."
mkdir -p public/uploads/pastors
mkdir -p public/uploads/sermons
mkdir -p public/uploads/events
mkdir -p public/uploads/gallery
chmod 755 public/uploads -R
echo "      ✓ Directories created"
echo ""

echo "[2/5] Activating virtual environment..."
if [ ! -d "venv" ]; then
    echo "      Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "      ✓ Virtual environment activated"
echo ""

echo "[3/5] Installing dependencies..."
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
echo "      ✓ Dependencies installed"
echo ""

echo "[4/5] Running database migrations..."
python manage.py migrate --noinput
echo "      ✓ Migrations completed"
echo ""

echo "[5/5] Collecting static files..."
python manage.py collectstatic --noinput > /dev/null 2>&1
echo "      ✓ Static files collected"
echo ""

echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Create admin user:"
echo "     python manage.py createsuperuser"
echo ""
echo "  2. In cPanel, go to Setup Python App"
echo "     and click RESTART for your application"
echo ""
echo "  3. Test the API:"
echo "     curl https://yourapi.com/api/admin/auth/me"
echo ""
echo "  4. Log in to Django admin:"
echo "     https://yourapi.com/admin/"
echo ""