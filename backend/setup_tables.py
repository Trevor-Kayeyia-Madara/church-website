#!/usr/bin/env python
"""
cPanel Table Creation Script (Non-Interactive)

Run this in cPanel Terminal to create all database tables:
  python setup_tables.py

This creates:
  - AdminUser table
  - Session table (new, for persistent sessions)
  - All other app tables
"""

import sys
import os

def setup_tables():
    """Create all database tables (AdminUser + Session)"""
    
    # Add backend to path
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, backend_dir)
    
    print("=" * 60)
    print("  TABLE CREATION SCRIPT")
    print("=" * 60)
    print()
    
    try:
        from app.config import settings
        
        # Verify DATABASE_URL
        if not settings.sqlalchemy_database_url:
            print("[ERROR] DATABASE_URL not configured!")
            print("  Set DATABASE_URL in your .env file")
            print("  Example: mysql://user:pass@localhost:3306/db_name")
            sys.exit(1)
        
        print(f"Database URL: {settings.sqlalchemy_database_url[:30]}...")
        print()
        
        from app.db import create_engine
        from app.admin_auth import init_admin_db
        
        # Create engine
        print("[1/3] Creating database engine...")
        engine = create_engine(settings.sqlalchemy_database_url, pool_pre_ping=True, future=True)
        print("       ✓ Engine created")
        print()
        
        # Create tables (including new Session table)
        print("[2/3] Creating tables...")
        init_admin_db(engine)
        print("       ✓ AdminUser table: CREATED or EXISTS")
        print("       ✓ Session table: CREATED or EXISTS")
        print()
        
        # Verify
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("[3/3] Verifying tables...")
        for table in sorted(tables):
            print(f"       ✓ {table}")
        print()
        
        print("=" * 60)
        print("  ALL TABLES CREATED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("  1. Create admin user: python init_admin.py create")
        print("  2. Start server: flask run --port=8000")
        print("  3. Test: curl http://localhost:8000/health")
        print()
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    setup_tables()
