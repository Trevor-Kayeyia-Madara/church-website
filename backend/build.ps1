# Backend build and deployment script for cPanel
# Run this locally to prepare the backend for upload

Write-Host "Building Flask backend for cPanel deployment..." -ForegroundColor Cyan

# Step 1: Create virtual environment
Write-Host "`n1. Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv

# Step 2: Activate virtual environment and install dependencies
Write-Host "2. Installing Python dependencies..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Step 3: Verify Flask app can be imported
Write-Host "3. Verifying Flask app..." -ForegroundColor Yellow
python -c "from app.app import create_app; print('Flask app loads successfully')"

Write-Host "`nBackend ready! Files to upload:" -ForegroundColor Green
Write-Host "  - backend/venv/ (Python virtual environment - size may be large)" -ForegroundColor White
Write-Host "  - backend/app/ (application code)" -ForegroundColor White
Write-Host "  - backend/requirements.txt" -ForegroundColor White
Write-Host "  - backend/passenger_wsgi.py" -ForegroundColor White
Write-Host "  - backend/.env (create from .env.example with your values)" -ForegroundColor White
Write-Host "  - backend/database_init.sql" -ForegroundColor White

Write-Host "`nAlternative (smaller upload):" -ForegroundColor Yellow
Write-Host "  Install dependencies on cPanel instead of uploading venv/ to reduce upload size." -ForegroundColor White
