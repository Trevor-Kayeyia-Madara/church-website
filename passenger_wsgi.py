# -*- coding: utf-8 -*-
"""
cPanel Passenger WSGI entry point.
This file is used by cPanel's Python Application interface.
"""
import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Set the working directory to backend
os.chdir(backend_path)

# Import and create the Flask app
from app.app import create_app
application = create_app()
