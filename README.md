# Deliverance Church Utawala

## Project structure (refactored)

- `backend/` — Python (Flask) API for cPanel hosting
- `frontend/` — Vite + React frontend (all UI code under `frontend/src/`)

---

# Legacy notes (Next.js)

Production-ready church web app built with:

- Next.js (App Router) + React (JavaScript only)
- Tailwind CSS (custom theme in `tailwind.config.js`)
- Next.js Route Handlers (`app/api/*`) + Prisma
- MySQL / MariaDB (cPanel-friendly)

## Setup

1) Install dependencies:

```bash
npm install
```

2) Configure environment variables:

- Copy `.env.example` → `.env`
- Update `DATABASE_URL` if needed

3) Start a local MySQL/MariaDB database (optional but recommended):

```bash
docker compose up -d
```

4) Create tables + seed sample data (Prisma):

```bash
npm run prisma:migrate
npm run prisma:seed
```

If you can't run Prisma migrations on your host (common on shared hosting),
import `prisma/mysql_init.sql` in phpMyAdmin, then run `npm run prisma:seed`
from a machine where Prisma can connect to your cPanel database.

5) Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Pages

- `/` Homepage (hero, quick actions, featured sermons, live + giving)
- `/sermons` Sermon browsing (featured, categories, search, pagination)
- `/contact` Contact form (API-backed), giving sidebar, service times, map

## API

- `GET /api/sermons` (supports `page`, `limit`, `category`, `q`)
- `GET /api/sermons/:id` (accepts sermon `id` or `slug`)
- `POST /api/contact`
- `POST /api/donations`

## YouTube Import (Sermons)

Set the following in `.env`:

- `YOUTUBE_API_KEY`
- `YOUTUBE_PLAYLIST_ID` (recommended) **or** `YOUTUBE_CHANNEL_ID`

Then sync into the database:

```bash
# Sign in via Google at /admin/youtube, then click "Sync Now"
```

If the DB has no sermons yet and YouTube env vars are configured, `GET /api/sermons` will also read directly from YouTube as a temporary fallback.

If `DATABASE_URL` is not configured, APIs fall back to mock data so the UI remains usable during setup.
