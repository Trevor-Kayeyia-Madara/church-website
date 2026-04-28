# Frontend (Vite + React)

This frontend contains all UI code under `frontend/src/` (imports like `@/components/...` map to `frontend/src/components`).

## Run locally

1) Start backend:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
set FLASK_APP=app.app:app
flask run --port 8000
```

2) Start frontend:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:8000`.
