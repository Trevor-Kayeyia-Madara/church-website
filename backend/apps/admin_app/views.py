from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
from .models import Category, Sermon, Message, Event, Pastor, Ministry, GalleryItem, SiteSettings
from .serializers import (
    CategorySerializer, SermonSerializer, MessageSerializer,
    EventSerializer, PastorSerializer, MinistrySerializer,
    GalleryItemSerializer, SiteSettingsSerializer
)


class CustomModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'ok': True, 'items': serializer.data})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({'ok': True, 'item': serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({'ok': True, 'item': serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({'ok': True, 'message': f'{self.get_queryset().model.__name__} updated'})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'ok': True, 'message': f'{self.get_queryset().model.__name__} deleted'})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({'ok': True, 'user': {'id': user.id, 'username': user.username, 'email': user.email}})
    return Response({'error': 'Invalid credentials'}, status=401)


@api_view(['POST'])
@permission_classes([AllowAny])
def setup_admin_view(request):
    if User.objects.filter(is_superuser=True).exists():
        return Response({'error': 'Superuser already exists'}, status=403)

    token = request.headers.get('X-ADMIN-SETUP-TOKEN') or request.data.get('token')
    expected_token = os.getenv('ADMIN_SETUP_TOKEN', '')
    if not expected_token or token != expected_token:
        return Response({'error': 'Invalid setup token'}, status=401)

    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()
    email = request.data.get('email', '').strip()

    if not username or not password:
        return Response({'error': 'username and password are required'}, status=400)

    user = User.objects.create_superuser(username=username, email=email or '', password=password)
    return Response({'ok': True, 'user': {'id': user.id, 'username': user.username, 'email': user.email}})


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'ok': True})


@api_view(['GET'])
def me_view(request):
    if request.user.is_authenticated:
        return Response({
            'ok': True,
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
            },
        })
    return Response({'authenticated': False}, status=401)


@api_view(['POST'])
def upload_pastor_photo(request):
    return _handle_upload(request, 'pastors')


@api_view(['POST'])
def upload_sermon_thumb(request):
    return _handle_upload(request, 'sermons')


@api_view(['POST'])
def upload_event_poster(request):
    return _handle_upload(request, 'events')


@api_view(['POST'])
def upload_gallery(request):
    return _handle_upload(request, 'gallery')


def _handle_upload(request, subdir):
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)

    file = request.FILES['file']
    if not file:
        return Response({'error': 'No file selected'}, status=400)

    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ext = file.name.lower().split('.')[-1]
    if ext not in allowed_extensions:
        return Response({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}, status=400)

    filename = default_storage.save(f'{subdir}/{file.name}', ContentFile(file.read()))
    url = f'{settings.MEDIA_URL}{filename}'
    return Response({'ok': True, 'url': url})


class CategoryViewSet(CustomModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SermonViewSet(CustomModelViewSet):
    queryset = Sermon.objects.all()
    serializer_class = SermonSerializer


class MessageViewSet(CustomModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer


class EventViewSet(CustomModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class PastorViewSet(CustomModelViewSet):
    queryset = Pastor.objects.all()
    serializer_class = PastorSerializer


class MinistryViewSet(CustomModelViewSet):
    queryset = Ministry.objects.all()
    serializer_class = MinistrySerializer


class GalleryItemViewSet(CustomModelViewSet):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer


class SiteSettingsViewSet(CustomModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer

    @action(detail=False, methods=['get', 'put'])
    def bulk(self, request):
        if request.method == 'GET':
            settings = {s.key: s.value for s in self.queryset}
            return Response(settings)
        elif request.method == 'PUT':
            data = request.data
            for key, value in data.items():
                SiteSettings.objects.update_or_create(key=key, defaults={'value': value})
            return Response({'message': 'Settings updated'})