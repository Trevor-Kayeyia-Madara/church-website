import json
import os
import uuid
from datetime import datetime, timezone
import traceback
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.mail import EmailMessage
from django.db import transaction
from django.utils.text import slugify
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category, Event, GalleryItem, Message, Ministry, Pastor, Sermon, SiteSettings
from .serializers import (
    CategorySerializer,
    EventSerializer,
    GalleryItemSerializer,
    MessageSerializer,
    MinistrySerializer,
    PastorSerializer,
    SermonSerializer,
    SiteSettingsSerializer,
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


def _new_id():
    return uuid.uuid4().hex


def _ensure_slug(value, fallback):
    value = (value or '').strip()
    if value:
        return slugify(value)[:191] or _new_id()
    return slugify(fallback)[:191] or _new_id()


def _get_site_settings(default=None):
    default = default or {}
    row = SiteSettings.objects.filter(key='site').first()
    if not row or not row.value:
        return default
    try:
        parsed = json.loads(row.value)
        return parsed if isinstance(parsed, dict) else default
    except Exception:
        return default


@csrf_exempt
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


@api_view(['GET'])
@permission_classes([AllowAny])
def debug_view(request):
    return Response({
        'ok': True,
        'path': request.path,
        'method': request.method,
        'origin': request.headers.get('Origin'),
        'cors_allowed_origins': os.getenv('CORS_ALLOWED_ORIGINS', ''),
    })


@csrf_exempt
@api_view(['POST', 'GET'])
def logout_view(request):
    logout(request)
    callback_url = request.query_params.get('callbackUrl') or request.query_params.get('callback_url')
    if request.method == 'GET' and callback_url:
        from django.http import HttpResponseRedirect
        return HttpResponseRedirect(callback_url)
    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([AllowAny])
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


@api_view(['GET'])
@permission_classes([AllowAny])
def public_site_view(request):
    # Stored as JSON in SiteSettings(key='site'), falling back to a small default.
    default_site = {
        'name': 'Deliverance Church Utawala',
        'shortName': 'DC Utawala',
        'tagline': 'The Church of Choice',
        'location': 'Utawala, Nairobi, Kenya',
        'logoUrl': '/logo.png',
        'contact': {
            'email': 'info@dcutawala.org',
        },
    }
    site = {**default_site, **_get_site_settings(default_site)}
    return Response({'ok': True, 'site': site})


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def public_contact_view(request):
    name = (request.data.get('name') or '').strip()
    email = (request.data.get('email') or '').strip()
    phone = (request.data.get('phone') or '').strip()
    subject = (request.data.get('subject') or '').strip()
    message = (request.data.get('message') or '').strip()

    serializer = MessageSerializer(data={
        'id': _new_id(),
        'name': name,
        'email': email,
        'phone': phone,
        'subject': subject,
        'message': message,
    })
    serializer.is_valid(raise_exception=True)
    serializer.save()

    # Notify official inboxes
    recipients = ['dcutawala@gmail.com', 'info@dcutawala.org']
    mail_sent = False
    mail_error = None
    try:
        title = subject or 'Website Contact Form'
        body = '\n'.join([
            f'Subject: {title}',
            f'Name: {name}',
            f'Email: {email}',
            f'Phone: {phone or "-"}',
            '',
            message,
        ])
        msg = EmailMessage(
            subject=f'[DC Utawala] {title}',
            body=body,
            to=recipients,
            reply_to=[email] if email else None,
        )
        msg.send(fail_silently=False)
        mail_sent = True
    except Exception as e:
        mail_error = str(e)

    payload = {'ok': True, 'mailSent': mail_sent}
    if getattr(settings, 'DEBUG', False) and mail_error:
        payload['mailError'] = mail_error
    return Response(payload)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_pastors_view(request):
    limit = request.query_params.get('limit')
    qs = Pastor.objects.filter(is_published=True).order_by('sort_order', 'name')
    if limit:
        try:
            qs = qs[: max(1, min(int(limit), 200))]
        except Exception:
            pass
    return Response({'ok': True, 'items': PastorSerializer(qs, many=True).data})


def _yt_get_json(endpoint, params):
    api_key = os.getenv('YOUTUBE_API_KEY') or ''
    if not api_key:
        raise ValueError('Missing YOUTUBE_API_KEY')

    q = dict(params or {})
    q['key'] = api_key
    url = f'https://www.googleapis.com/youtube/v3/{endpoint}?{urlencode(q)}'
    req = Request(url, headers={'accept': 'application/json'})
    try:
        with urlopen(req, timeout=20) as res:
            payload = res.read().decode('utf-8')
            return json.loads(payload or '{}')
    except HTTPError as e:
        body = ''
        try:
            body = e.read().decode('utf-8')
        except Exception:
            pass
        raise RuntimeError(f'YouTube API error {e.code}: {body or e.reason}')
    except URLError as e:
        raise RuntimeError(f'YouTube API request failed: {e.reason}')


def _parse_yt_datetime(value):
    s = (value or '').strip()
    if not s:
        return None
    try:
        if s.endswith('Z'):
            s = s[:-1] + '+00:00'
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def _parse_iso8601_duration_minutes(value):
    # Basic support for PT#H#M#S
    s = (value or '').strip()
    if not s.startswith('PT'):
        return None
    hours = minutes = seconds = 0
    num = ''
    for ch in s[2:]:
        if ch.isdigit():
            num += ch
            continue
        if not num:
            continue
        if ch == 'H':
            hours = int(num)
        elif ch == 'M':
            minutes = int(num)
        elif ch == 'S':
            seconds = int(num)
        num = ''
    total = hours * 3600 + minutes * 60 + seconds
    return int(round(total / 60)) if total else 0


def _mysql_safe_text(value):
    """
    Some MySQL setups use `utf8` (3-byte) instead of `utf8mb4` and will error on
    4-byte Unicode characters (e.g. emoji). Strip those characters to avoid
    breaking sync jobs. Preferred fix is migrating DB/table/columns to utf8mb4.
    """
    s = (value or '')
    if not s:
        return s
    return ''.join(ch for ch in s if ord(ch) <= 0xFFFF)


def _simple_sermon_title(value):
    s = _mysql_safe_text(value)
    s = ' '.join(str(s).split())
    return s[:191] or 'Sermon'


def _simple_sermon_description(value):
    s = _mysql_safe_text(value)
    s = str(s).strip()
    return s or None


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_youtube_view(request):
    """
    Admin-only: import the latest videos from a configured YouTube playlist or channel uploads
    and upsert them into the Sermon table.

    Env vars:
      - YOUTUBE_API_KEY (required)
      - YOUTUBE_PLAYLIST_ID or YOUTUBE_CHANNEL_ID (one required)
      - YOUTUBE_SYNC_MAX (optional, default 50)
    """
    try:
        playlist_id = (os.getenv('YOUTUBE_PLAYLIST_ID') or '').strip()
        channel_id = (os.getenv('YOUTUBE_CHANNEL_ID') or '').strip()
        try:
            max_items = int((os.getenv('YOUTUBE_SYNC_MAX') or '50').strip() or '50')
        except Exception:
            max_items = 50
        max_items = max(1, min(max_items, 50))

        if not playlist_id and channel_id:
            data = _yt_get_json('channels', {
                'part': 'contentDetails',
                'id': channel_id,
                'maxResults': 1,
            })
            items = data.get('items') or []
            uploads = (items[0].get('contentDetails') or {}).get('relatedPlaylists', {}).get('uploads') if items else None
            playlist_id = uploads or ''

        if not playlist_id:
            return Response({'ok': False, 'error': 'Missing YOUTUBE_PLAYLIST_ID or YOUTUBE_CHANNEL_ID'}, status=400)

        playlist_items = _yt_get_json('playlistItems', {
            'part': 'contentDetails',
            'playlistId': playlist_id,
            'maxResults': max_items,
        })
        video_ids = []
        for item in (playlist_items.get('items') or []):
            vid = ((item.get('contentDetails') or {}).get('videoId') or '').strip()
            if vid:
                video_ids.append(vid)
        video_ids = list(dict.fromkeys(video_ids))  # unique, preserve order

        if not video_ids:
            return Response({'ok': True, 'created': 0, 'updated': 0, 'total': 0, 'items': []})

        videos = _yt_get_json('videos', {
            'part': 'snippet,contentDetails',
            'id': ','.join(video_ids),
        })

        created = 0
        updated = 0
        out = []

        by_id = {v.get('id'): v for v in (videos.get('items') or [])}
        for vid in video_ids:
            v = by_id.get(vid) or {}
            snippet = v.get('snippet') or {}
            content = v.get('contentDetails') or {}

            title = (snippet.get('title') or '').strip() or f'YouTube video {vid}'
            description = (snippet.get('description') or '').strip() or None

            title = _simple_sermon_title(title)
            description = _simple_sermon_description(description)
            published_at = _parse_yt_datetime(snippet.get('publishedAt')) or datetime.now(timezone.utc)
            duration_minutes = _parse_iso8601_duration_minutes(content.get('duration'))
            thumbs = snippet.get('thumbnails') or {}
            thumb = (thumbs.get('maxres') or thumbs.get('standard') or thumbs.get('high') or thumbs.get('medium') or thumbs.get('default') or {})
            thumbnail_url = (thumb.get('url') or '').strip() or None
            video_url = f'https://www.youtube.com/watch?v={vid}'

            obj = Sermon.objects.filter(id=vid).first()
            if obj:
                obj.slug = vid
                obj.title = title
                obj.description = description
                obj.date = published_at
                obj.duration_minutes = duration_minutes
                obj.thumbnail_url = thumbnail_url
                obj.video_url = video_url
                obj.save()
                updated += 1
            else:
                Sermon.objects.create(
                    id=vid,
                    slug=vid,
                    title=title,
                    description=description,
                    speaker=None,
                    date=published_at,
                    duration_minutes=duration_minutes,
                    thumbnail_url=thumbnail_url,
                    video_url=video_url,
                    category=None,
                )
                created += 1

            out.append({'id': vid, 'title': title, 'publishedAt': published_at.isoformat(), 'thumbnailUrl': thumbnail_url})

        return Response({'ok': True, 'created': created, 'updated': updated, 'total': len(video_ids), 'items': out})
    except ValueError as e:
        return Response({'ok': False, 'error': str(e)}, status=400)
    except RuntimeError as e:
        # Upstream (YouTube) or network error
        return Response({'ok': False, 'error': str(e)}, status=502)
    except Exception as e:
        # Unexpected server error: include details only in DEBUG to aid diagnostics.
        if getattr(settings, 'DEBUG', False):
            return Response(
                {
                    'ok': False,
                    'error': f'Sync failed: {type(e).__name__}: {e}',
                    'trace': traceback.format_exc(),
                },
                status=500,
            )
        return Response({'ok': False, 'error': f'Sync failed: {type(e).__name__}'}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_ministries_view(request):
    qs = Ministry.objects.filter(is_published=True).order_by('sort_order', 'title')
    return Response({'ok': True, 'items': MinistrySerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([AllowAny])
def public_events_view(request):
    limit = request.query_params.get('limit')
    upcoming = str(request.query_params.get('upcoming') or '').lower() in {'1', 'true', 'yes'}
    qs = Event.objects.filter(is_published=True)
    if upcoming:
        from django.utils import timezone
        qs = qs.filter(start_at__gte=timezone.now()).order_by('start_at')
    else:
        qs = qs.order_by('-start_at')
    if limit:
        try:
            qs = qs[: max(1, min(int(limit), 200))]
        except Exception:
            pass
    return Response({'ok': True, 'items': EventSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([AllowAny])
def public_sermons_view(request):
    # `source=youtube` is ignored in Django backend; we serve DB-backed sermons only.
    limit = request.query_params.get('limit')
    qs = Sermon.objects.all().order_by('-date')
    if limit:
        try:
            qs = qs[: max(1, min(int(limit), 200))]
        except Exception:
            pass
    return Response({'ok': True, 'items': SermonSerializer(qs, many=True).data})


@api_view(['GET'])
@permission_classes([AllowAny])
def public_sermon_detail_view(request, sermon_id):
    sermon = Sermon.objects.filter(id=sermon_id).first() or Sermon.objects.filter(slug=sermon_id).first()
    if not sermon:
        return Response({'ok': False, 'error': 'Not found'}, status=404)
    return Response({'ok': True, 'item': SermonSerializer(sermon).data})


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

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        payload = dict(request.data)
        payload['id'] = _new_id()
        payload['slug'] = _ensure_slug(payload.get('slug'), payload.get('name') or payload['id'])
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return Response({'ok': True, 'item': self.get_serializer(category).data})


class SermonViewSet(CustomModelViewSet):
    queryset = Sermon.objects.all()
    serializer_class = SermonSerializer

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset().order_by('-date'), many=True)
        categories = CategorySerializer(Category.objects.all().order_by('name'), many=True).data
        return Response({'ok': True, 'items': serializer.data, 'categories': categories})

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        category_slug = (request.data.get('categorySlug') or '').strip()
        category_name = (request.data.get('categoryName') or '').strip()
        category = None
        if category_slug or category_name:
            category_slug = _ensure_slug(category_slug, category_name or category_slug)
            category, _ = Category.objects.update_or_create(
                slug=category_slug,
                defaults={'id': _new_id(), 'name': category_name or category_slug},
            )

        payload = dict(request.data)
        payload['id'] = _new_id()
        payload['slug'] = _ensure_slug(payload.get('slug'), payload.get('title') or payload['id'])
        payload['title'] = _simple_sermon_title(payload.get('title'))
        payload['description'] = _simple_sermon_description(payload.get('description'))

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        sermon = serializer.save(category=category)
        return Response({'ok': True, 'item': self.get_serializer(sermon).data})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        category_slug = (request.data.get('categorySlug') or '').strip()
        category_name = (request.data.get('categoryName') or '').strip()
        category = instance.category
        if category_slug or category_name:
            category_slug = _ensure_slug(category_slug, category_name or category_slug)
            category, _ = Category.objects.update_or_create(
                slug=category_slug,
                defaults={'id': _new_id(), 'name': category_name or category_slug},
            )

        payload = dict(request.data)
        payload['slug'] = _ensure_slug(payload.get('slug'), payload.get('title') or instance.slug or instance.id)
        payload['title'] = _simple_sermon_title(payload.get('title'))
        payload['description'] = _simple_sermon_description(payload.get('description'))
        serializer = self.get_serializer(instance, data=payload, partial=False)
        serializer.is_valid(raise_exception=True)
        sermon = serializer.save(category=category)
        return Response({'ok': True, 'message': 'Sermon updated', 'item': self.get_serializer(sermon).data})


class MessageViewSet(CustomModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        payload = dict(request.data)
        payload['id'] = _new_id()
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        msg = serializer.save()
        return Response({'ok': True, 'item': self.get_serializer(msg).data})


class EventViewSet(CustomModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        payload = dict(request.data)
        payload['id'] = _new_id()
        payload['slug'] = _ensure_slug(payload.get('slug'), payload.get('title') or payload['id'])
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        return Response({'ok': True, 'item': self.get_serializer(event).data})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        payload = dict(request.data)
        payload['slug'] = _ensure_slug(payload.get('slug'), payload.get('title') or instance.slug or instance.id)
        serializer = self.get_serializer(instance, data=payload, partial=False)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        return Response({'ok': True, 'message': 'Event updated', 'item': self.get_serializer(event).data})


class PastorViewSet(CustomModelViewSet):
    queryset = Pastor.objects.all()
    serializer_class = PastorSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        payload = dict(request.data)
        payload['id'] = _new_id()
        payload['slug'] = _ensure_slug(payload.get('slug'), payload.get('name') or payload['id'])
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        pastor = serializer.save()
        return Response({'ok': True, 'item': self.get_serializer(pastor).data})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        payload = dict(request.data)
        payload['slug'] = _ensure_slug(payload.get('slug'), payload.get('name') or instance.slug or instance.id)
        serializer = self.get_serializer(instance, data=payload, partial=False)
        serializer.is_valid(raise_exception=True)
        pastor = serializer.save()
        return Response({'ok': True, 'message': 'Pastor updated', 'item': self.get_serializer(pastor).data})


class MinistryViewSet(CustomModelViewSet):
    queryset = Ministry.objects.all()
    serializer_class = MinistrySerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        payload = dict(request.data)
        payload['id'] = _new_id()
        payload['slug'] = _ensure_slug(payload.get('slug'), payload.get('title') or payload['id'])
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        ministry = serializer.save()
        return Response({'ok': True, 'item': self.get_serializer(ministry).data})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        payload = dict(request.data)
        payload['slug'] = _ensure_slug(payload.get('slug'), payload.get('title') or instance.slug or instance.id)
        serializer = self.get_serializer(instance, data=payload, partial=False)
        serializer.is_valid(raise_exception=True)
        ministry = serializer.save()
        return Response({'ok': True, 'message': 'Ministry updated', 'item': self.get_serializer(ministry).data})


class GalleryItemViewSet(CustomModelViewSet):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        payload = dict(request.data)
        payload['id'] = _new_id()
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response({'ok': True, 'item': self.get_serializer(item).data})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        payload = dict(request.data)
        serializer = self.get_serializer(instance, data=payload, partial=False)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response({'ok': True, 'message': 'Gallery item updated', 'item': self.get_serializer(item).data})


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


@api_view(['GET', 'PUT'])
def admin_site_settings_view(request):
    # Stores the entire site-settings object as JSON under key='site'.
    if request.method == 'GET':
        settings_obj = _get_site_settings(default={})
        return Response({'ok': True, 'settings': settings_obj})

    data = request.data if isinstance(request.data, dict) else {}
    row, created = SiteSettings.objects.get_or_create(
        key='site',
        defaults={'id': _new_id(), 'value': ''},
    )
    row.value = json.dumps(data, ensure_ascii=False)
    row.save(update_fields=['value', 'updated_at'])
    return Response({'ok': True, 'settings': _get_site_settings(default={})})
