# Postman Testing Guide - Admin API

## 📥 Import Collection

1. Open **Postman**
2. Click **Import** → **Upload Files**
3. Select: `backend/postman_collection.json`
4. Collection "Deliverance Church Utawala - Backend API" appears

---

## 🧪 Step 1: Test Public Endpoints (No Auth)

### **Test Health**
```
GET https://api.dcutawala.org/health
```
Expected: `{"ok":true}`

### **Test Site Settings**
```
GET https://api.dcutawala.org/api/site
```
Expected: JSON with church site configuration

---

## 🔐 Step 2: Login & Get Token

### **POST Admin Login**

**Request:**
```
POST https://api.dcutawala.org/api/admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "YOUR_PASSWORD_HERE"
}
```

**Using Postman:**
- Find folder: **Admin Authentication** → **Login (Get Token)**
- Click **Body** tab → ensure **raw** → **JSON** selected
- Replace `YOUR_PASSWORD_HERE` with actual admin password
- Click **Send**

**Expected Response (200 OK):**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@dcutawala.org"
  }
}
```

**COPY the `token` value** — you'll need it for all other admin requests.

---

## ✅ Step 3: Set Token in Postman

**Quick way:**
1. After login response, click **Tests** tab in the request
2. Add this script to auto-save token:

```javascript
// Save token to environment variable
const json = pm.response.json();
if (json.token) {
    pm.environment.set("admin_token", json.token);
    console.log("Token saved:", json.token);
}
```

3. Send request again → token saved to `{{admin_token}}`

**OR manually:**
- In Postman, click the **eye icon** (Environment) → **Global** → Add variable:
  - Key: `admin_token`
  - Value: paste your token here
  - Type: `Text`

---

## 🎯 Step 4: Test Admin Endpoints

All admin requests now have `Authorization: Bearer {{admin_token}}` header automatically (Pre-request Script or manually add).

### **Test: Verify Session**
```
GET https://api.dcutawala.org/api/admin/auth/me
Authorization: Bearer {{admin_token}}
```

Expected: `{"ok":true,"authenticated":true}`

---

### **Test: List Sermons (Admin)**
```
GET https://api.dcutawala.org/api/admin/sermons?page=1&limit=50
Authorization: Bearer {{admin_token}}
```

Expected: `{"ok":true, "items": [...], "categories": [...]}`

---

### **Test: Create Sermon**
```
POST https://api.dcutawala.org/api/admin/sermons
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "title": "Test Sermon from Postman",
  "description": "This is a test sermon created via API",
  "speaker": "Pastor Test",
  "date": "2025-05-04T10:00:00",
  "durationMinutes": 30,
  "thumbnailUrl": "https://via.placeholder.com/300x200",
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "categorySlug": "sermons",
  "categoryName": "Sermons"
}
```

Expected: `{"ok":true, "item":{"id":"...","slug":"...","title":"..."}}`

---

### **Test: Update Sermon**
```
PUT https://api.dcutawala.org/api/admin/sermons/SERMON_ID_HERE
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "title": "Updated Sermon Title",
  "description": "Updated description"
}
```

Replace `SERMON_ID_HERE` with actual ID from list response.

---

### **Test: Create Event**
```
POST https://api.dcutawala.org/api/admin/events
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "title": "Sunday Service",
  "description": "Join us for worship this Sunday",
  "location": "Main Sanctuary",
  "posterUrl": "https://via.placeholder.com/400x600",
  "startAt": "2025-05-04T10:00:00",
  "endAt": "2025-05-04T13:00:00",
  "isPublished": true
}
```

---

### **Test: List Messages (Contact Submissions)**
```
GET https://api.dcutawala.org/api/admin/messages?page=1&limit=50
Authorization: Bearer {{admin_token}}
```

---

### **Test: Get Settings**
```
GET https://api.dcutawala.org/api/admin/settings
Authorization: Bearer {{admin_token}}
```

---

### **Test: Update Settings**
```
PUT https://api.dcutawala.org/api/admin/settings
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "siteName": "Deliverance Church Utawala",
  "tagline": "The Church Of Choice",
  "contact": {
    "phoneDisplay": "+254 700 000 000",
    "email": "info@dcutawala.org"
  },
  "social": {
    "youtube": "https://youtube.com/@dcutawala",
    "facebook": "https://facebook.com/dcutawala"
  }
}
```

---

### **Test: Create Gallery Item**
```
POST https://api.dcutawala.org/api/admin/gallery
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "imageUrl": "https://via.placeholder.com/800x600",
  "caption": "Church event photo",
  "sortOrder": 1,
  "isPublished": true
}
```

---

## 🗑️ Step 5: Test Delete (Cleanup)

After testing, delete test data:

**Delete Sermon:**
```
DELETE https://api.dcutawala.org/api/admin/sermons/SERMON_ID
Authorization: Bearer {{admin_token}}
```

**Delete Event:**
```
DELETE https://api.dcutawala.org/api/admin/events/EVENT_ID
Authorization: Bearer {{admin_token}}
```

**Delete Gallery:**
```
DELETE https://api.dcutawala.org/api/admin/gallery/ITEM_ID
Authorization: Bearer {{admin_token}}
```

---

## 🚨 Common Errors & Fixes

| Error | Meaning | Fix |
|-------|---------|-----|
| `401 Unauthorized` | Token missing/invalid | Get fresh token via login, set `admin_token` env var |
| `403 Forbidden` | Token provided but admin not configured | Verify admin user exists in DB; check `AUTH_ALLOWED_EMAILS` if using NextAuth (frontend) |
| `404 Not Found` | Endpoint doesn't exist | Check URL path; ensure backend deployed correctly |
| `500 Internal Server Error` | Server error | Check cPanel error logs; ensure `.env` and DB configured |
| `Database connection error` | DB not set up | Verify `DATABASE_URL` in `.env`, MySQL user + DB exist |
| `"error": "Invalid payload"` | Validation failed | Check required fields match schema (see API docs) |

---

## 📝 Quick Test Sequence (Copy-Paste)

1. **Login** → copy token
2. **Set token** in Postman environment
3. **GET** `/api/admin/auth/me` → expect `{"ok":true}`
4. **GET** `/api/admin/sermons` → expect list (empty or with items)
5. **POST** `/api/admin/sermons` → create test sermon
6. **GET** `/api/admin/sermons` → confirm created
7. **PUT** `/api/admin/sermons/{id}` → update test sermon
8. **DELETE** `/api/admin/sermons/{id}` → cleanup
9. **POST** `/api/admin/events` → create test event
10. **DELETE** `/api/admin/events/{id}` → cleanup

---

## 🔄 Token Refresh

The token stored in-memory on server — if server restarts, token becomes invalid. Simply **login again** to get new token.

---

## 📋 Expected Response Formats

### Login Success
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@dcutawala.org"
  }
}
```

### Sermon List
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid",
      "slug": "sermon-title-2025-01-15",
      "title": "Sermon Title",
      "description": null,
      "speaker": "Pastor Name",
      "date": "2025-01-15T10:00:00Z",
      "durationMinutes": 45,
      "thumbnailUrl": null,
      "videoUrl": null,
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "Sermons",
        "slug": "sermons"
      },
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "categories": [
    {"id":"...", "name":"Sermons", "slug":"sermons"}
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

### Settings Response
```json
{
  "ok": true,
  "settings": {
    "siteName": "Deliverance Church Utawala",
    "shortName": "DCU",
    "tagline": "The Church Of Choice",
    "location": "Utawala, Nairobi",
    "logoUrl": null,
    "liveEmbedUrl": null,
    "serviceTimes": null,
    "school": null,
    "giving": null,
    "contact": {
      "addressLine1": "",
      "addressLine2": "",
      "phoneDisplay": "",
      "phoneTel": "",
      "email": ""
    },
    "social": {
      "youtube": "",
      "facebook": "",
      "instagram": "",
      "tiktok": "",
      "linktree": ""
    }
  }
}
```

---

**Import the JSON collection and start testing!** All endpoints are pre-configured with proper headers and example bodies.
