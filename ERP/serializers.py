from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from HR.serializers import userSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings
from PIM.models import *
from HR.models import *

class addressSerializer(serializers.ModelSerializer):
    class Meta:
        model = address
        fields = ('pk' , 'street' , 'city' , 'state' , 'pincode', 'lat' , 'lon', 'country')


class applicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = application
        fields = ( 'pk', 'name' , 'description' , 'icon' ,  'haveJs' , 'haveCss' , 'inMenu')

class applicationSettingsSerializer(serializers.ModelSerializer):
    # non admin mode
    class Meta:
        model = appSettingsField
        fields = ( 'pk', 'name', 'flag' , 'value' , 'fieldType')

class applicationSettingsAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = appSettingsField
        fields = ( 'pk', 'name', 'flag' , 'value' , 'description' , 'created', 'fieldType')
    def create(self , validated_data):
        s = appSettingsField()
        s.name = validated_data.pop('name')
        s.flag = validated_data.pop('flag')
        if 'value' in self.context['request'].data:
            s.value = self.context['request'].data['value']
        s.description = validated_data.pop('description')
        s.fieldType = validated_data.pop('fieldType')
        if s.fieldType == 'flag':
            s.value = ""
        s.save()
        return s

class permissionSerializer(serializers.ModelSerializer):
    app = applicationSerializer(read_only = True, many = False)
    class Meta:
        model = permission
        fields = ( 'pk' , 'app' , 'user' )
    def create(self , validated_data):
        user = self.context['request'].user
        if not user.is_superuser and user not in app.owners.all():
            raise PermissionDenied(detail=None)
        u = validated_data['user']
        permission.objects.filter(user = u).all().delete()
        for a in self.context['request'].data['apps']:
            app = application.objects.get(pk = a)
            p = permission.objects.create(app =  app, user = u , givenBy = user)
        return p

class groupPermissionSerializer(serializers.ModelSerializer):
    app = applicationSerializer(read_only = True, many = False)
    class Meta:
        model = groupPermission
        fields = ( 'pk' , 'app' , 'group' )

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = media
        fields = ('pk' , 'link' , 'attachment' , 'mediaType' )

    def create(self , validated_data):
        print "came to create"
        f = media(**validated_data)
        f.user=self.context['request'].user
        f.save()
        return f

class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class EventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Events
        fields = ('pk' , 'name', 'promoted','event_On', 'event_ends_On', 'regEndsOn', 'venue', 'entryFee', 'description', 'venueGMapUrl')

class EventItemSerializer(serializers.ModelSerializer):
    event = EventsSerializer(read_only = True, many = False)
    class Meta:
        model = EventItem
        fields = ('pk' , 'event', 'title', 'typ', 'description', 'pic', 'entryFee', 'moderator', 'eventTime' ,'dayNumber')
    def create(self , validated_data):
        print "came to create"
        e = EventItem(**validated_data)
        e.event=Events.objects.get(pk=self.context['request'].data['event'])
        e.save()
        return e

class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ('pk' ,'name', 'email', 'phoneNumber', 'regId', 'payAmount', 'payMode', 'payDate', 'payRefference', 'cancelReg')


class userProfileLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = profile
        fields = ('displayPicture' ,'pk' ,'email', 'mobile')

class userLiteSerializer(serializers.ModelSerializer):
    profile = userProfileLiteSerializer(many=False , read_only=True)
    class Meta:
        model = User
        fields = ( 'pk', 'username' , 'first_name' , 'last_name' , 'profile')

class EventLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Events
        fields = ('pk' , 'name','event_On','regEndsOn', 'venue', 'entryFee')

class blogLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = blogPost
        fields = ( 'pk' ,'title' , 'shortUrl' , 'author')

class FeaturedPageSerializer(serializers.ModelSerializer):
    event = EventLiteSerializer(read_only = True, many = False)
    person = userLiteSerializer(read_only = True, many = False)
    blog = blogLiteSerializer(read_only = True, many = False)
    class Meta:
        model = FeaturedPage
        fields = ('pk' , 'created' , 'active' , 'typ' ,'person' ,'event' ,'blog')

    def create(self , validated_data):
        print "came to create"
        print validated_data
        f = FeaturedPage(**validated_data)
        if validated_data['typ'] == 'person':
            f.person = User.objects.get(pk = self.context['request'].data['obj'])
        elif validated_data['typ'] == 'event':
            f.event = Events.objects.get(pk = self.context['request'].data['obj'])
        elif validated_data['typ'] == 'blog':
            f.blog = blogPost.objects.get(pk = self.context['request'].data['obj'])
        f.save()
        return f

    def update(self, instance, validated_data):
        instance.active = validated_data['active']
        instance.save()
        return instance
