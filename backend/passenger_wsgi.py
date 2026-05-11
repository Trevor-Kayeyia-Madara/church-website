# -*- coding: utf-8 -*-
"""
Passenger/DirectAdmin WSGI entry point.

DirectAdmin expects:
- Application startup file: passenger_wsgi.py
- Application entry point: application
"""

import os
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent

# Support two common layouts:
# 1) passenger_wsgi.py in repo root, Django project in ./backend/
# 2) passenger_wsgi.py inside ./backend/ alongside manage.py
if (BASE_DIR / "manage.py").exists():
    DJANGO_ROOT = BASE_DIR
elif (BASE_DIR / "backend" / "manage.py").exists():
    DJANGO_ROOT = BASE_DIR / "backend"
else:
    DJANGO_ROOT = BASE_DIR

# Ensure Django project root is importable
sys.path.insert(0, str(DJANGO_ROOT))
os.chdir(str(DJANGO_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

from backend.wsgi import application  # noqa: E402
