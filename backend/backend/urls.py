"""
URL configuration for church backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.admin_app import views as api

urlpatterns = [
    path('admin/', admin.site.urls),
    # Public API used by the Vite frontend
    path('api/site', api.public_site_view),
    path('api/site/', api.public_site_view),
    path('api/contact', api.public_contact_view),
    path('api/contact/', api.public_contact_view),
    path('api/pastors', api.public_pastors_view),
    path('api/pastors/', api.public_pastors_view),
    path('api/ministries', api.public_ministries_view),
    path('api/ministries/', api.public_ministries_view),
    path('api/events', api.public_events_view),
    path('api/events/', api.public_events_view),
    path('api/sermons', api.public_sermons_view),
    path('api/sermons/', api.public_sermons_view),
    # Admin-only: sync from YouTube into Sermon table
    path('api/sermons/sync-youtube', api.sync_youtube_view),
    path('api/sermons/sync-youtube/', api.sync_youtube_view),
    path('api/sermons/<str:sermon_id>', api.public_sermon_detail_view),
    path('api/sermons/<str:sermon_id>/', api.public_sermon_detail_view),

    # Admin API (session auth)
    path('api/admin/', include('apps.admin_app.urls')),
    path('api/admin/auth/debug', api.debug_view),
    path('api/admin/auth/debug/', api.debug_view),

    # Compatibility: admin UI "Sign Out" link in frontend points here
    path('api/auth/signout', api.logout_view),
    path('api/auth/signout/', api.logout_view),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
