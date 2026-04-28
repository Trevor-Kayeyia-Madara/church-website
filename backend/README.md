# Backend (Flask)

This backend is WSGI-friendly for typical cPanel Python hosting.

## Run locally

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
set FLASK_APP=app.app:app
flask run --port 8000
```

Or with a production server (recommended locally too):

```bash
pip install waitress
python -c "from waitress import serve; from app.app import app; serve(app, host='127.0.0.1', port=8000)"
```

## Environment

- `DATABASE_URL` (optional): Prisma-style MySQL URL like `mysql://user:pass@host:3306/dbname`
- `CORS_ALLOW_ORIGINS` (optional): `*` or comma-separated list
- `FRONTEND_DIST_DIR` (optional): path to built Vite `dist/` folder to serve the frontend from the same app
- `YOUTUBE_API_KEY` (optional)
- `YOUTUBE_PLAYLIST_ID` (optional)
- `YOUTUBE_CHANNEL_ID` (optional)
- `YOUTUBE_MAX_RESULTS` (optional, default `50`)
