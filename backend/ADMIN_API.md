# Admin Dashboard - Backend API Documentation

## Overview

The admin dashboard backend provides RESTful API endpoints for managing church website content. Built with Flask and SQLAlchemy, it uses JWT-style token authentication.

## Setup

1. **Initialize the database tables and create first admin user:**
   ```bash
   cd backend
   python init_admin.py create
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   Create `.env` file (copy from `.env.example`) with your database credentials.

4. **Run the Flask app:**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Unix/Mac
   pip install -r requirements.txt
   set FLASK_APP=app.app:app
   flask run --port 8000
   ```

## Authentication

All admin endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

### Login
```
POST /api/admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}
```

Response:
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@church.org"
  }
}
```

### Logout
```
POST /api/admin/auth/logout
Authorization: Bearer <token>
```

### Verify Session
```
GET /api/admin/auth/me
Authorization: Bearer <token>
```

## Admin Endpoints

### Site Settings

**Get Settings**
```
GET /api/admin/settings
```

**Update Settings**
```
PUT /api/admin/settings
Content-Type: application/json

{
  "siteName": "Deliverance Church Utawala",
  "shortName": "DCU",
  "tagline": "The Church Of Choice",
  "location": "Utawala, Nairobi",
  "logoUrl": "https://example.com/logo.png",
  "liveEmbedUrl": "https://youtube.com/embed/...",
  "contact": {
    "addressLine1": "123 Main St",
    "addressLine2": "Utawala",
    "phoneDisplay": "+254 700 000 000",
    "phoneTel": "+254700000000",
    "email": "info@dcutawala.org"
  },
  "social": {
    "youtube": "https://youtube.com/@church",
    "facebook": "https://facebook.com/church",
    "instagram": "https://instagram.com/church",
    "tiktok": "https://tiktok.com/@church",
    "linktree": "https://linktr.ee/church"
  }
}
```

### Sermons

**List Sermons**
```
GET /api/admin/sermons?page=1&limit=50
```

**Create Sermon**
```
POST /api/admin/sermons
Content-Type: application/json

{
  "title": "The Grace of God",
  "description": "A powerful message about grace...",
  "speaker": "Pastor John Doe",
  "date": "2025-04-15T10:00:00",
  "durationMinutes": 45,
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "videoUrl": "https://youtube.com/watch?v=...",
  "categorySlug": "sermons",
  "categoryName": "Sermons"
}
```

**Update Sermon**
```
PUT /api/admin/sermons/<sermon_id>
```

**Delete Sermon**
```
DELETE /api/admin/sermons/<sermon_id>
```

**Get Single Sermon**
```
GET /api/admin/sermons/<sermon_id>
```

### Events

**List Events**
```
GET /api/admin/events?page=1&limit=50
```

**Create Event**
```
POST /api/admin/events
{
  "title": "Sunday Service",
  "description": "Join us for worship...",
  "location": "Main Sanctuary",
  "posterUrl": "https://example.com/poster.jpg",
  "startAt": "2025-05-04T10:00:00",
  "endAt": "2025-05-04T13:00:00",
  "isPublished": true
}
```

**Update Event**
```
PUT /api/admin/events/<event_id>
```

**Delete Event**
```
DELETE /api/admin/events/<event_id>
```

### Pastors

**List Pastors**
```
GET /api/admin/pastors
```

**Create Pastor**
```
POST /api/admin/pastors
{
  "name": "Pastor John Doe",
  "roleTitle": "Senior Pastor",
  "bio": "Biography text...",
  "photoUrl": "https://example.com/photo.jpg",
  "sortOrder": 1,
  "isPublished": true
}
```

**Update Pastor**
```
PUT /api/admin/pastors/<pastor_id>
```

**Delete Pastor**
```
DELETE /api/admin/pastors/<pastor_id>
```

### Ministries

**List Ministries**
```
GET /api/admin/ministries
```

**Create Ministry**
```
POST /api/admin/ministries
{
  "title": "Youth Ministry",
  "description": "Empowering young people...",
  "highlights": ["Weekly meetings", "Bible studies", "Outreach"],
  "imageUrl": "https://example.com/ministry.jpg",
  "sortOrder": 1,
  "isPublished": true
}
```

**Update Ministry**
```
PUT /api/admin/ministries/<ministry_id>
```

**Delete Ministry**
```
DELETE /api/admin/ministries/<ministry_id>
```

### Messages (Contact Form Submissions)

**List Messages**
```
GET /api/admin/messages?page=1&limit=50
```

### Gallery

**List Gallery Items**
```
GET /api/admin/gallery
```

**Create Gallery Item**
```
POST /api/admin/gallery
{
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Church event photo",
  "sortOrder": 1,
  "isPublished": true
}
```

**Update Gallery Item**
```
PUT /api/admin/gallery/<item_id>
```

**Delete Gallery Item**
```
DELETE /api/admin/gallery/<item_id>
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Error description",
  "details": {
    "field": "Validation error message"
  }
}
```

Status codes:
- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not found
- `500` - Server error

## Deployment Notes

1. **Production security:** The token store is in-memory. For production, replace with Redis or database-backed session storage.

2. **HTTPS:** Always use HTTPS in production to protect credentials.

3. **Rate limiting:** Implement rate limiting on auth endpoints to prevent brute force attacks.

4. **File uploads:** The API accepts URLs for images. For direct uploads, implement file upload endpoints that store files and return URLs.

5. **CORS:** The Flask app allows CORS for configured origins. Update `CORS_ALLOW_ORIGINS` in production.

## Database Schema

The admin system adds:
- `AdminUser` table for authentication
- `GalleryItem` table for photo gallery management
- Reuses existing tables: Sermon, Event, Pastor, Ministry, Message, SiteSettings
