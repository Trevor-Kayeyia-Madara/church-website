#!/usr/bin/env python
"""Create Django database tables for the backend.

This script loads the Django settings, creates any missing migrations for the
`admin_app`, and applies database migrations so the required tables are created.

Usage:
    python create_tables.py
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
from django.core.management import call_command


def main():
    django.setup()

    # Create migrations for the app if they do not already exist.
    call_command('makemigrations', 'admin_app')

    # Apply migrations to create tables in the configured database.
    call_command('migrate', '--noinput')

    print('\nDatabase tables created successfully.')


if __name__ == '__main__':
    main()
