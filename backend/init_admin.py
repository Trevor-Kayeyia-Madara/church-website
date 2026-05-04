#!/usr/bin/env python
"""Initialize admin user for cPanel production deployment"""

import sys
import os

# Add backend to path (adjust if your folder name is different)
backend_dir = '/backend-app'  # ← CHANGE THIS if your folder is different
if os.path.exists(backend_dir):
    sys.path.insert(0, backend_dir)
else:
    print(f"❌ Backend directory not found: {backend_dir}")
    print("   Please check the path in this script.")
    sys.exit(1)

# Environment variables should be set in cPanel under "Set Python App" for your application.
# Required: DATABASE_URL, CORS_ALLOW_ORIGINS, FLASK_ENV

try:
    from app.db import SessionLocal, create_engine
    from app.admin_auth import AdminUser, init_admin_db
    from app.config import settings
    from sqlalchemy import select


    # Build engine
    engine = create_engine(settings.sqlalchemy_database_url, pool_pre_ping=True, future=True)
    init_admin_db(engine)
    
    # Admin credentials - CHANGE THESE!
    ADMIN_USERNAME = 'admin'
    ADMIN_EMAIL = 'admin@dcutawala.org'
    ADMIN_PASSWORD = 'Uta@2026.dc'  # ⚠️ CHANGE THIS BEFORE RUNNING!
    
    with SessionLocal() as db:
        existing = db.execute(
            select(AdminUser).where(AdminUser.username == ADMIN_USERNAME)
        ).scalar_one_or_none()
        
        if existing:
            print(f"Admin user '{ADMIN_USERNAME}' already exists (ID: {existing.id})")
            sys.exit(0)
        
        admin = AdminUser(username=ADMIN_USERNAME, email=ADMIN_EMAIL)
        admin.set_password(ADMIN_PASSWORD)
        db.add(admin)
        db.commit()
        
        print(f"✅ Admin user created successfully!")
        print(f"   Username: {ADMIN_USERNAME}")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print()
        print("🔐 IMPORTANT: Change this password after first login!")
        print("   You can reset it later with: python admin_manage.py reset admin")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
