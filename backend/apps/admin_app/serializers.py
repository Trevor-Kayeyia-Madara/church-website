from rest_framework import serializers
from .models import Category, Sermon, Message, Event, Pastor, Ministry, GalleryItem, SiteSettings


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class SermonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sermon
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class PastorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pastor
        fields = '__all__'


class MinistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Ministry
        fields = '__all__'


class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = '__all__'


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'