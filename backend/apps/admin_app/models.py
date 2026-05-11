from django.db import models
from django.contrib.auth.models import AbstractUser


class Category(models.Model):
    id = models.CharField(max_length=191, primary_key=True)
    name = models.CharField(max_length=191)
    slug = models.SlugField(unique=True, max_length=191)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Category'

    def __str__(self):
        return self.name


class Sermon(models.Model):
    id = models.CharField(max_length=191, primary_key=True)
    slug = models.SlugField(unique=True, max_length=191)
    title = models.CharField(max_length=191)
    description = models.TextField(blank=True, null=True)
    speaker = models.CharField(max_length=191, blank=True, null=True)
    date = models.DateTimeField()
    duration_minutes = models.IntegerField(blank=True, null=True)
    thumbnail_url = models.URLField(max_length=500, blank=True, null=True)
    video_url = models.URLField(max_length=500, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Sermon'
        ordering = ['-date']

    def __str__(self):
        return self.title


class Message(models.Model):
    id = models.CharField(max_length=191, primary_key=True)
    name = models.CharField(max_length=191)
    email = models.EmailField(max_length=191)
    phone = models.CharField(max_length=191, blank=True, null=True)
    subject = models.CharField(max_length=191, blank=True, null=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Message'

    def __str__(self):
        return f"Message from {self.name}"


class Event(models.Model):
    id = models.CharField(max_length=191, primary_key=True)
    slug = models.SlugField(unique=True, max_length=191)
    title = models.CharField(max_length=191)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=191, blank=True, null=True)
    poster_url = models.URLField(max_length=500, blank=True, null=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField(blank=True, null=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Event'
        ordering = ['-start_at']

    def __str__(self):
        return self.title


class Pastor(models.Model):
    id = models.CharField(max_length=191, primary_key=True)
    slug = models.SlugField(unique=True, max_length=191)
    name = models.CharField(max_length=191)
    role_title = models.CharField(max_length=191, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    photo_url = models.URLField(blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Pastor'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class Ministry(models.Model):
    id = models.CharField(max_length=191, primary_key=True)
    slug = models.SlugField(unique=True, max_length=191)
    title = models.CharField(max_length=191)
    description = models.TextField(blank=True, null=True)
    highlights = models.JSONField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Ministry'
        ordering = ['sort_order', 'title']

    def __str__(self):
        return self.title


class GalleryItem(models.Model):
    id = models.CharField(max_length=191, primary_key=True)
    title = models.CharField(max_length=191, blank=True, null=True)
    image_url = models.URLField(max_length=500)
    alt_text = models.CharField(max_length=500, blank=True, null=True)
    caption = models.CharField(max_length=500, blank=True, null=True)
    category = models.CharField(max_length=191, blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'GalleryItem'
        ordering = ['-created_at']

    def __str__(self):
        return self.caption or f"Gallery item {self.id}"


class SiteSettings(models.Model):
    id = models.CharField(max_length=191, primary_key=True)
    key = models.CharField(max_length=191, unique=True)
    value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'SiteSettings'

    def __str__(self):
        return self.key
