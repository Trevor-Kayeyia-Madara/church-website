# Admin Dashboard Integration Guide (Frontend → Backend)

The frontend already has admin pages. This guide connects the Next.js frontend to the Flask backend admin API.

## Backend Endpoints

Base URL: `http://localhost:8000` (or your deployed cPanel domain)

| Frontend (Next.js) | Backend (Flask) | Method |
|---|---|---|
| `/api/admin/auth/login` | `/api/admin/auth/login` | POST |
| `/api/admin/auth/logout` | `/api/admin/auth/logout` | POST |
| `/api/admin/auth/me` | `/api/admin/auth/me` | GET |
| `/api/admin/sermons` | `/api/admin/sermons` | GET, POST |
| `/api/admin/sermons/[id]` | `/api/admin/sermons/<id>` | GET, PUT, DELETE |
| `/api/admin/events` | `/api/admin/events` | GET, POST |
| `/api/admin/events/[id]` | `/api/admin/events/<id>` | GET, PUT, DELETE |
| `/api/admin/pastors` | `/api/admin/pastors` | GET, POST |
| `/api/admin/pastors/[id]` | `/api/admin/pastors/<id>` | GET, PUT, DELETE |
| `/api/admin/ministries` | `/api/admin/ministries` | GET, POST |
| `/api/admin/ministries/[id]` | `/api/admin/ministries/<id>` | GET, PUT, DELETE |
| `/api/admin/messages` | `/api/admin/messages` | GET |
| `/api/admin/settings` | `/api/admin/settings` | GET, PUT |
| `/api/admin/gallery` | `/api/admin/gallery` | GET, POST |
| `/api/admin/gallery/[id]` | `/api/admin/gallery/<id>` | PUT, DELETE |

## Quick Update for Frontend

The frontend routes use Next.js Route Handlers. Update them to proxy requests to the Flask backend:

**Option A: Direct fetch to backend**
```javascript
// In your Next.js admin API routes (/frontend/src/app/api/admin/*/route.jsx)
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const token = cookies().get("admin_token")?.value; // or from session

const res = await fetch(`${BACKEND_URL}/api/admin/sermons`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
});
```

**Option B: Forward through Next.js API routes**
Keep the existing Next.js routes as pass-through proxies to the Flask backend.

## Authentication Flow

1. **Login** → POST to `/api/admin/auth/login` with username/password
2. **Store token** → Save returned token in HTTP-only cookie or localStorage
3. **Use token** → Include `Authorization: Bearer <token>` header in all subsequent requests
4. **Logout** → POST to `/api/admin/auth/logout` to revoke token

## Example: Sermons Admin Page

Replace `frontend/src/app/admin/sermons/page.jsx` with:

```jsx
"use server";

import { cookies } from "next/headers";
import AdminSermonsClient from "./SermonsClient";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value || null;
}

async function getSermons() {
  const token = await getToken();
  const res = await fetch(`${BACKEND_URL}/api/admin/sermons`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function AdminSermonsPage() {
  const data = await getSermons();
  return <AdminSermonsClient initialSermons={data.items} />;
}
```

## Environment Variables

Create `.env.local` in the frontend:

```env
BACKEND_URL=http://localhost:8000
# For production:
# BACKEND_URL=https://dcutawala.org
```

## Token Storage

**Recommended:** Use HTTP-only secure cookies for the admin token to prevent XSS attacks.

**Alternative:** localStorage (easier but less secure)

Important: Set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=Strict` in production.

## cPanel Deployment

1. Flask backend: Deploy to Python app on cPanel (uses `passenger_wsgi.py`)
2. Frontend: Build and deploy to `/public_html` (or subdirectory)
3. Set `BACKEND_URL` in frontend to Flask app URL
4. Enable CORS in Flask `.env`: `CORS_ALLOW_ORIGINS=https://dcutawala.org`
