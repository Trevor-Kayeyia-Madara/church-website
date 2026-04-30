#!/usr/bin/env python
"""Admin management commands for Deliverance Church Utawala backend"""

import sys
import getpass
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.admin_auth import AdminUser, init_admin_db


def _get_engine():
    """Create SQLAlchemy engine from settings"""
    database_url = settings.sqlalchemy_database_url
    if not database_url:
        print("❌ Error: DATABASE_URL not configured!")
        print("   Copy .env.example to .env and set DATABASE_URL")
        print("   Example: mysql://user:pass@localhost:3306/church_db")
        sys.exit(1)
    return create_engine(database_url, pool_pre_ping=True, future=True)


def init_admin_user():
    """Create the first admin user"""
    print("=" * 60)
    print("  Deliverance Church Utawala - Admin User Setup")
    print("=" * 60)
    print()

    engine = _get_engine()
    init_admin_db(engine)
    print("✓ Admin database tables initialized")
    print()

    username = input("Username (e.g. admin): ").strip()
    email = input("Email: ").strip()
    password = getpass.getpass("Password: ").strip()
    password_confirm = getpass.getpass("Confirm password: ").strip()

    if not username or not email or not password:
        print("❌ Error: username, email, and password are required")
        sys.exit(1)

    if password != password_confirm:
        print("❌ Error: passwords do not match")
        sys.exit(1)

    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
    with Session() as db:
        existing = db.execute(
            select(AdminUser).where(
                (AdminUser.username == username) | (AdminUser.email == email)
            )
        ).scalar_one_or_none()

        if existing:
            print(f"❌ Error: User with username '{username}' or email '{email}' already exists")
            sys.exit(1)

        admin = AdminUser(username=username, email=email)
        admin.set_password(password)

        db.add(admin)
        db.commit()

        print()
        print("✅ Admin user created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print()
        print("   You can now log in at /admin")


def list_admin_users():
    """List all admin users"""
    engine = _get_engine()
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

    with Session() as db:
        users = db.execute(select(AdminUser).order_by(AdminUser.username)).scalars().all()
        if not users:
            print("No admin users found")
        else:
            print(f"{'ID':<5} {'Username':<20} {'Email':<35} {'Active'}")
            print("-" * 70)
            for u in users:
                print(f"{u.id:<5} {u.username:<20} {u.email:<35} {u.is_active}")


def delete_admin_user(identifier: str):
    """Delete admin user by username or email"""
    engine = _get_engine()
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

    with Session() as db:
        user = db.execute(
            select(AdminUser).where(
                (AdminUser.username == identifier) | (AdminUser.email == identifier)
            )
        ).scalar_one_or_none()

        if not user:
            print(f"❌ No admin user found: {identifier}")
            sys.exit(1)

        confirm = input(f"Delete admin '{user.username}' ({user.email})? (yes/no): ").strip().lower()
        if confirm != "yes":
            print("Cancelled")
            sys.exit(0)

        db.delete(user)
        db.commit()
        print(f"✅ Admin '{user.username}' deleted")


def reset_password(username_or_email: str):
    """Reset admin password"""
    engine = _get_engine()
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

    password = getpass.getpass("New password: ").strip()
    password_confirm = getpass.getpass("Confirm: ").strip()

    if password != password_confirm:
        print("❌ Error: passwords do not match")
        sys.exit(1)

    with Session() as db:
        user = db.execute(
            select(AdminUser).where(
                (AdminUser.username == username_or_email) | (AdminUser.email == username_or_email)
            )
        ).scalar_one_or_none()

        if not user:
            print(f"❌ Error: admin user '{username_or_email}' not found")
            sys.exit(1)

        user.set_password(password)
        db.commit()
        print(f"✅ Password reset for '{user.username}'")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python admin_manage.py create        # Create admin user (interactive)")
        print("  python admin_manage.py list          # List all admin users")
        print("  python admin_manage.py delete <user> # Delete admin by username/email")
        print("  python admin_manage.py reset <user>  # Reset admin password")
        print()
        print("Example:")
        print("  python admin_manage.py create")
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "create":
        init_admin_user()
    elif command == "list":
        list_admin_users()
    elif command == "delete":
        if len(sys.argv) < 3:
            print("Error: username or email required")
            sys.exit(1)
        delete_admin_user(sys.argv[2])
    elif command == "reset":
        if len(sys.argv) < 3:
            print("Error: username or email required")
            sys.exit(1)
        reset_password(sys.argv[2])
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
