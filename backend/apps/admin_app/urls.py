from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter(trailing_slash='/?')
router.register(r'categories', views.CategoryViewSet, basename='categories')
router.register(r'sermons', views.SermonViewSet, basename='sermons')
router.register(r'messages', views.MessageViewSet, basename='messages')
router.register(r'events', views.EventViewSet, basename='events')
router.register(r'pastors', views.PastorViewSet, basename='pastors')
router.register(r'ministries', views.MinistryViewSet, basename='ministries')
router.register(r'gallery', views.GalleryItemViewSet, basename='gallery')

urlpatterns = [
    # Admin auth (session cookies)
    path('auth/login', views.login_view),
    path('auth/login/', views.login_view),
    path('auth/logout', views.logout_view),
    path('auth/logout/', views.logout_view),
    path('auth/me', views.me_view),
    path('auth/me/', views.me_view),

    # Admin uploads
    path('upload/pastor-photo', views.upload_pastor_photo),
    path('upload/pastor-photo/', views.upload_pastor_photo),
    path('upload/sermon-thumb', views.upload_sermon_thumb),
    path('upload/sermon-thumb/', views.upload_sermon_thumb),
    path('upload/event-poster', views.upload_event_poster),
    path('upload/event-poster/', views.upload_event_poster),
    path('upload/gallery', views.upload_gallery),
    path('upload/gallery/', views.upload_gallery),

    # Admin site settings (matches frontend)
    path('site-settings', views.admin_site_settings_view),
    path('site-settings/', views.admin_site_settings_view),

    # CRUD endpoints (router)
    path('', include(router.urls)),
]
