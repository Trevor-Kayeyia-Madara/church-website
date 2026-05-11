from django.contrib import admin
from .models import Category, Sermon, Message, Event, Pastor, Ministry, GalleryItem, SiteSettings


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Sermon)
class SermonAdmin(admin.ModelAdmin):
    list_display = ['title', 'speaker', 'date', 'category']
    list_filter = ['category', 'date']
    search_fields = ['title', 'speaker', 'description']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'date'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'created_at']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['created_at']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'start_at', 'location', 'is_published']
    list_filter = ['is_published', 'start_at']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'start_at'


@admin.register(Pastor)
class PastorAdmin(admin.ModelAdmin):
    list_display = ['name', 'role_title', 'sort_order', 'is_published']
    list_filter = ['is_published']
    search_fields = ['name', 'bio']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Ministry)
class MinistryAdmin(admin.ModelAdmin):
    list_display = ['title', 'sort_order', 'is_published']
    list_filter = ['is_published']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ['caption', 'sort_order', 'is_published', 'created_at']
    list_filter = ['is_published']
    search_fields = ['caption']


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['key', 'value']
    search_fields = ['key']
