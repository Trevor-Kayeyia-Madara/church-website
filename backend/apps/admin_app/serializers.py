from rest_framework import serializers

from .models import Category, Sermon, Message, Event, Pastor, Ministry, GalleryItem, SiteSettings


class CategorySerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'createdAt', 'updatedAt']


class SermonSerializer(serializers.ModelSerializer):
    durationMinutes = serializers.IntegerField(source='duration_minutes', required=False, allow_null=True)
    thumbnailUrl = serializers.URLField(
        source='thumbnail_url',
        required=False,
        allow_null=True,
        allow_blank=True,
        max_length=500,
    )
    videoUrl = serializers.URLField(
        source='video_url',
        required=False,
        allow_null=True,
        allow_blank=True,
        max_length=500,
    )
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Sermon
        fields = [
            'id',
            'slug',
            'title',
            'description',
            'speaker',
            'date',
            'durationMinutes',
            'thumbnailUrl',
            'videoUrl',
            'category',
            'createdAt',
            'updatedAt',
        ]


class MessageSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'createdAt']


class EventSerializer(serializers.ModelSerializer):
    posterUrl = serializers.URLField(
        source='poster_url',
        required=False,
        allow_null=True,
        allow_blank=True,
        max_length=500,
    )
    startAt = serializers.DateTimeField(source='start_at')
    endAt = serializers.DateTimeField(source='end_at', required=False, allow_null=True)
    isPublished = serializers.BooleanField(source='is_published', required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id',
            'slug',
            'title',
            'description',
            'location',
            'posterUrl',
            'startAt',
            'endAt',
            'isPublished',
            'createdAt',
            'updatedAt',
        ]


class PastorSerializer(serializers.ModelSerializer):
    roleTitle = serializers.CharField(source='role_title', required=False, allow_blank=True, allow_null=True)
    photoUrl = serializers.URLField(source='photo_url', required=False, allow_blank=True, allow_null=True)
    sortOrder = serializers.IntegerField(source='sort_order', required=False)
    isPublished = serializers.BooleanField(source='is_published', required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Pastor
        fields = [
            'id',
            'slug',
            'name',
            'roleTitle',
            'bio',
            'photoUrl',
            'sortOrder',
            'isPublished',
            'createdAt',
            'updatedAt',
        ]


class MinistrySerializer(serializers.ModelSerializer):
    imageUrl = serializers.URLField(source='image_url', required=False, allow_blank=True, allow_null=True, max_length=500)
    sortOrder = serializers.IntegerField(source='sort_order', required=False)
    isPublished = serializers.BooleanField(source='is_published', required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Ministry
        fields = [
            'id',
            'slug',
            'title',
            'description',
            'highlights',
            'imageUrl',
            'sortOrder',
            'isPublished',
            'createdAt',
            'updatedAt',
        ]


class GalleryItemSerializer(serializers.ModelSerializer):
    imageUrl = serializers.URLField(source='image_url', required=True, max_length=500)
    altText = serializers.CharField(source='alt_text', required=False, allow_blank=True, allow_null=True)
    sortOrder = serializers.IntegerField(source='sort_order', required=False)
    isPublished = serializers.BooleanField(source='is_published', required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = GalleryItem
        fields = [
            'id',
            'title',
            'imageUrl',
            'altText',
            'caption',
            'category',
            'sortOrder',
            'isPublished',
            'createdAt',
            'updatedAt',
        ]


class SiteSettingsSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = SiteSettings
        fields = ['id', 'key', 'value', 'createdAt', 'updatedAt']
