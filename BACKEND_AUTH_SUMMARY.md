# Backend Auth (Django)

The backend is Django + Django REST Framework and uses Django’s built-in session authentication for the admin API under:

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST|GET /api/admin/auth/logout`

Admin requests should include cookies (the frontend uses `credentials: "include"` where needed).
