# Frontend (Vite + React)

This frontend contains all UI code under `frontend/src/` (imports like `@/components/...` map to `frontend/src/components`).

## Run locally

1) Start backend:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

2) Start frontend:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:8000`.

## Production API base URL

When deploying the frontend and backend on different origins (e.g. frontend on `https://dcutawala.org` and backend on `https://api.dcutawala.org`), set:

- `VITE_API_BASE_URL=https://api.dcutawala.org`
