#!/usr/bin/env python
"""
Create a Django superuser non-interactively (for hosting panels with no TTY).

Usage (DirectAdmin "Execute python script"):
  create_superuser.py

Required environment variables (set them in your hosting UI):
  DJANGO_SUPERUSER_USERNAME
  DJANGO_SUPERUSER_EMAIL
  DJANGO_SUPERUSER_PASSWORD
"""

import os
import sys


def main() -> int:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

    username = (os.getenv("DJANGO_SUPERUSER_USERNAME") or "").strip()
    email = (os.getenv("DJANGO_SUPERUSER_EMAIL") or "").strip()
    password = os.getenv("DJANGO_SUPERUSER_PASSWORD") or ""

    if not username or not password:
        print(
            "ERROR: Missing env vars. Set DJANGO_SUPERUSER_USERNAME and DJANGO_SUPERUSER_PASSWORD "
            "(and optionally DJANGO_SUPERUSER_EMAIL).",
            file=sys.stderr,
        )
        return 2

    import django

    django.setup()

    from django.contrib.auth import get_user_model

    User = get_user_model()

    existing = User.objects.filter(username=username).first()
    if existing:
        if not existing.is_superuser or not existing.is_staff:
            existing.is_staff = True
            existing.is_superuser = True
            if password:
                existing.set_password(password)
            if email and not existing.email:
                existing.email = email
            existing.save()
        print(f"OK: Superuser '{username}' already exists.")
        return 0

    User.objects.create_superuser(username=username, email=email or "", password=password)
    print(f"OK: Superuser '{username}' created.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

