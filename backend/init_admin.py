#!/usr/bin/env python
"""Initialize admin user for the church management system"""

import sys
import getpass
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, select, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import sessionmaker, mapped_column, Mapped, DeclarativeBase
from app.config import settings
from app.admin_auth import AdminUser, init_admin_db


def create_admin():
    """Create an admin user interactively"""
    print("=== Deliverance Church Utawala - Admin User Setup ===\n")

    # Build engine from DATABASE_URL
    database_url = settings.sqlalchemy_database_url
    if not database_url:
        print("❌ Error: DATABASE_URL not configured!")
        print("   Copy .env.example to .env and set DATABASE_URL")
        print("   Example: mysql://user:pass@localhost:3306/church_db")
        sys.exit(1)

    engine = create_engine(database_url, pool_pre_ping=True, future=True)
    init_admin_db(engine)
    print("✓ Admin database tables initialized\n")

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


def delete_admin(identifier: str):
    """Delete admin user by username or email"""
    database_url = settings.sqlalchemy_database_url
    if not database_url:
        print("❌ Error: DATABASE_URL not configured!")
        sys.exit(1)

    engine = create_engine(database_url, pool_pre_ping=True, future=True)
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


def list_admins():
    """List all admin users"""
    database_url = settings.sqlalchemy_database_url
    if not database_url:
        print("❌ Error: DATABASE_URL not configured!")
        sys.exit(1)

    engine = create_engine(database_url, pool_pre_ping=True, future=True)
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


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python init_admin.py create    # Create admin user (interactive)")
        print("  python init_admin.py list      # List all admin users")
        print("  python init_admin.py delete <username_or_email>  # Delete admin user")
        print()
        print("Example:")
        print("  python init_admin.py create")
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "create":
        create_admin()
    elif command == "list":
        list_admins()
    elif command == "delete":
        if len(sys.argv) < 3:
            print("Error: username or email required")
            sys.exit(1)
        delete_admin(sys.argv[2])
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

    engine = create_engine(database_url, pool_pre_ping=True, future=True)
    init_admin_db(engine)
    print("✓ Admin database tables initialized\n")

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


def delete_admin(identifier: str):
    """Delete admin user by username or email"""
    database_url = settings.sqlalchemy_database_url
    if not database_url:
        print("❌ Error: DATABASE_URL not configured!")
        sys.exit(1)

    engine = create_engine(database_url, pool_pre_ping=True, future=True)
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


def list_admins():
    """List all admin users"""
    from sqlalchemy import select
    database_url = settings.sqlalchemy_database_url
    if not database_url:
        print("❌ Error: DATABASE_URL not configured!")
        sys.exit(1)

    engine = create_engine(database_url, pool_pre_ping=True, future=True)
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


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python init_admin.py create    # Create admin user (interactive)")
        print("  python init_admin.py list      # List all admin users")
        print("  python init_admin.py delete <username_or_email>  # Delete admin user")
        print()
        print("Example:")
        print("  python init_admin.py create")
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "create":
        create_admin()
    elif command == "list":
        list_admins()
    elif command == "delete":
        if len(sys.argv) < 3:
            print("Error: username or email required")
            sys.exit(1)
        delete_admin(sys.argv[2])
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

    if password != password_confirm:
        print("Error: passwords do not match")
        sys.exit(1)

    with SessionLocal() as db:
        # Check if user already exists
        existing = db.execute(
            select(AdminUser).where((AdminUser.username == username) | (AdminUser.email == email))
        ).scalar_one_or_none()

        if existing:
            print(f"Error: User with username '{username}' or email '{email}' already exists")
            sys.exit(1)

        admin = AdminUser(
            username=username,
            email=email,
        )
        admin.set_password(password)

        db.add(admin)
        db.commit()

        print(f"\n✓ Admin user '{username}' created successfully!")
        print(f"  Email: {email}")
        print("\nYou can now log in at /admin with these credentials.")


def delete_admin(username_or_email: str):
    """Delete an admin user by username or email"""
    with SessionLocal() as db:
        user = db.execute(
            select(AdminUser).where(
                (AdminUser.username == username_or_email) | (AdminUser.email == username_or_email)
            )
        ).scalar_one_or_none()

        if not user:
            print(f"Error: No admin user found with username/email: {username_or_email}")
            sys.exit(1)

        db.delete(user)
        db.commit()
        print(f"✓ Admin user '{username_or_email}' deleted successfully")


def list_admins():
    """List all admin users"""
    with SessionLocal() as db:
        users = db.execute(select(AdminUser).order_by(AdminUser.username)).scalars().all()
        if not users:
            print("No admin users found")
        else:
            print("Admin users:")
            for u in users:
                print(f"  ID: {u.id} | Username: {u.username} | Email: {u.email} | Active: {u.is_active}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python init_admin.py create    # Create admin user interactively")
        print("  python init_admin.py list      # List admin users")
        print("  python init_admin.py delete <username_or_email>  # Delete admin user")
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "create":
        create_admin()
    elif command == "list":
        list_admins()
    elif command == "delete":
        if len(sys.argv) < 3:
            print("Error: username or email required")
            sys.exit(1)
        delete_admin(sys.argv[2])
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
