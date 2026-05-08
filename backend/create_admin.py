#!/usr/bin/env python
"""Non-interactive admin creation for cPanel deployment"""

import sys
import os

def main():
    # Add backend to path (adjust if your folder name is different)
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    if os.path.exists(backend_dir):
        sys.path.insert(0, backend_dir)

    # Set environment variables from .env file if it exists
    from dotenv import load_dotenv
    dotenv_path = os.path.join(backend_dir, '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)

    # Environment variables can also be set in cPanel or in .env file
    # Required: DATABASE_URL
    # Optional: CORS_ALLOW_ORIGINS, API_PREFIX, FRONTEND_DIST_DIR

    try:
        from app.db import SessionLocal, create_engine
        from app.admin_auth import AdminUser, init_admin_db
        from app.config import settings
        from sqlalchemy import select
        
        # Build engine
        engine = create_engine(settings.sqlalchemy_database_url, pool_pre_ping=True, future=True)
        init_admin_db(engine)
        
        # Admin credentials from environment or defaults
        admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@dcutawala.org')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'ChangeMe123!')
        
        print(f"Creating admin user: {admin_username}")
        
        with SessionLocal() as db:
            existing = db.execute(
                select(AdminUser).where(AdminUser.username == admin_username)
            ).scalar_one_or_none()
            
            if existing:
                print(f"[WARNING] Admin user '{admin_username}' already exists (ID: {existing.id})")
                print("   To create a new one, delete the existing user first:")
                print(f"   python init_admin.py delete {admin_username}")
                return
            
            admin = AdminUser(username=admin_username, email=admin_email)
            admin.set_password(admin_password)
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
            print(f"\n[OK] Admin user created successfully!")
            print(f"   Username: {admin_username}")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
            print()
            print("[WARNING] IMPORTANT: Change this password after first login!")
            print("   You can reset it later with: python admin_manage.py reset admin")
            print()
            print("Login URL: http://localhost:3000/admin")
            return
            
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()


