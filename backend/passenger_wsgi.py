# Passenger WSGI entry point
import sys
import os

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Change working directory
os.chdir(backend_path)

# Load environment variables from .env if present
from dotenv import load_dotenv
dotenv_path = os.path.join(backend_path, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

# Import and create the Flask app
from app.app import create_app
application = create_app()
