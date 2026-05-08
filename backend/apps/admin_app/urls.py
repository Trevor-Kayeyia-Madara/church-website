from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'sermons', views.SermonViewSet)
router.register(r'messages', views.MessageViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'pastors', views.PastorViewSet)
router.register(r'ministries', views.MinistryViewSet)
router.register(r'gallery', views.GalleryItemViewSet)
router.register(r'settings', views.SiteSettingsViewSet)

urlpatterns = [
    path('auth/login', views.login_view, name='login'),
    path('auth/logout', views.logout_view, name='logout'),
    path('auth/me', views.me_view, name='me'),
    path('auth/setup-admin', views.setup_admin_view, name='setup_admin'),
    path('upload/pastor-photo', views.upload_pastor_photo, name='upload_pastor_photo'),
    path('upload/sermon-thumb', views.upload_sermon_thumb, name='upload_sermon_thumb'),
    path('upload/event-poster', views.upload_event_poster, name='upload_event_poster'),
    path('upload/gallery', views.upload_gallery, name='upload_gallery'),
    path('', include(router.urls)),
]