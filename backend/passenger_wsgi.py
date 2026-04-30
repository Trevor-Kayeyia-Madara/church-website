# Passenger WSGI entry point for cPanel
import sys
import os

# Get the directory where this file is located (works for any folder name)
app_dir = os.path.dirname(__file__)

# Add the app directory to Python path
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

# Change working directory to app directory
os.chdir(app_dir)

# Load environment variables from .env if present
try:
    from dotenv import load_dotenv
    dotenv_path = os.path.join(app_dir, '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)
except ImportError:
    pass  # dotenv not available, will use system env

# Import and create the Flask app
try:
    from app.app import create_app
    application = create_app()
except ImportError as e:
    # If import fails, print error for debugging
    print(f"Import error: {e}", file=sys.stderr)
    print(f"Python path: {sys.path}", file=sys.stderr)
    print(f"App dir: {app_dir}", file=sys.stderr)
    raise
