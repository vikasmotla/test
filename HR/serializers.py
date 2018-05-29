from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from django.utils import timezone
from .models import *
import json
import hashlib
import datetime
import random
from API.permissions import add_application_access
from social.serializers import ProductTagSerializer
from PIM.models import notification



class userProfileLiteSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    class Meta:
        model = profile
        fields = ('displayPicture' ,'pk' )

class userSearchSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    profile = userProfileLiteSerializer(many=False , read_only=True)
    class Meta:
        model = User
        fields = ( 'pk', 'username' , 'first_name' , 'last_name' , 'profile'  , 'date_joined')



class userProfileAdminModeSerializer(serializers.ModelSerializer):
    """ Only admin """
    class Meta:
        model = profile
        fields = ('pk','user', 'displayPicture', 'coverPicture', 'sellingProduct' ,'buyingProduct', 'email','mobile','website','cin','year_established','street','city','state','pincode','country','lat','lon','messageAlert','requestAlert','periodicNotification','newsletter','promotional',)

class UserProfileSelfModeSerializer(serializers.ModelSerializer):
    """ Only users """
    class Meta:
        model = profile
        fields = ('pk','user', 'displayPicture', 'coverPicture', 'sellingProduct' ,'buyingProduct', 'email','mobile','website','cin','year_established','street','city','state','pincode','country','lat','lon','messageAlert','requestAlert','periodicNotification','newsletter','promotional',)
        read_only_fields = ('displayPicture',)
    def update(self , instance , validated_data):
        if self.context['request'].user != instance.user:
            raise PermissionDenied()

        for key in ['married', 'dateOfBirth' , 'anivarsary','prefix', 'gender' , 'email', 'mobile' , 'emergency' , 'fathersName' , 'mothersName' , 'wifesName' , 'childCSV', 'sameAsLocal']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass

        instance.localAddress =  address.objects.get(pk = self.context['request'].data['localAddress']['pk'])
        try:
            instance.permanentAddress = address.objects.get(pk = self.context['request'].data['permanentAddress']['pk'])
        except:
            pass
        instance.save()
        return instance

class userProfileSerializer(serializers.ModelSerializer):
    """ allow all the user """
    sellingProduct = ProductTagSerializer(many=True , read_only=True)
    buyingProduct = ProductTagSerializer(many=True , read_only=True)
    class Meta:
        model = profile
        fields = ('pk','user', 'displayPicture', 'coverPicture', 'sellingProduct' ,'buyingProduct', 'email','mobile','website','cin','year_established','street','city','state','pincode','country','lat','lon','messageAlert','requestAlert','periodicNotification','newsletter','promotional','following')
    def update(self, instance, validated_data):
        print '@@@@@@@@@@@@@@@@@@@@@@22'
        print self.context['request'].data
        print validated_data
        for key in ['displayPicture', 'coverPicture', 'email','mobile','website','cin','year_established','street','city','state','pincode','country','messageAlert','requestAlert','periodicNotification','newsletter','promotional',]:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'sellingProduct' in  self.context['request'].data:
            instance.sellingProduct.clear()
            for p in self.context['request'].data['sellingProduct']:
                instance.sellingProduct.add( ProductTag.objects.get(pk = p))
        if 'buyingProduct' in  self.context['request'].data:
            instance.buyingProduct.clear()
            for p in self.context['request'].data['buyingProduct']:
                instance.buyingProduct.add( ProductTag.objects.get(pk = p))
        print 'start'
        if 'following' in self.context['request'].GET:
            print 'innnnnnnnnnn'
            if self.context['request'].GET['mode'] == 'follow':
                print "follow"
                print User.objects.get(pk = self.context['request'].GET['following'])
                n = notification( user = User.objects.get(pk = self.context['request'].GET['following']), originator = 'follow' , shortInfo = str(self.context['request'].user.pk) + ':followed' )
                n.save()
                instance.following.add( User.objects.get(pk = self.context['request'].GET['following']))
            elif self.context['request'].GET['mode'] == 'unfollow':
                instance.following.remove( User.objects.get(pk = self.context['request'].GET['following']))
        print 'endddddddddddddd'
        instance.save()
        return instance

class OficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ('pk' ,'parent','name','street','city','state','pincode','country','lat','lon','contactName','contactNumber','gstIn','licenceNumber',)
        read_only_fields = ('parent' ,)
    def create(self , validated_data):
        print validated_data,self.context['request'].data
        officeObj = Office.objects.create(**validated_data)
        officeObj.parent_id = self.context['request'].data['parent']
        officeObj.save()
        return officeObj

class userSerializer(serializers.ModelSerializer):
    profile = userProfileSerializer(many=False , read_only=True)
    class Meta:
        model = User
        fields = ('pk' , 'username' , 'email' , 'first_name' , 'last_name' ,'profile' , 'password' , 'date_joined', )
        read_only_fields = ('profile' ,'social',)
        extra_kwargs = {'password': {'write_only': True} }
    def create(self , validated_data):
        raise PermissionDenied(detail=None)
    def update (self, instance, validated_data):
        user = self.context['request'].user
        if authenticate(username = user.username , password = self.context['request'].data['oldPassword']) is not None:
            user = User.objects.get(username = user.username)
            user.set_password(validated_data['password'])
            user.save()
        else :
            raise PermissionDenied(detail=None)
        return user


class userAdminSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'url' , 'username' , 'email' , 'first_name' , 'last_name' , 'is_staff' ,'is_active' , 'date_joined' )
    def create(self , validated_data):
        if not self.context['request'].user.is_staff:
            raise PermissionDenied(detail=None)
        user = User.objects.create(**validated_data)
        password =  self.context['request'].data['password']
        user.set_password(password)
        user.save()

        add_application_access(user , ['app.dashboard' , 'app.calendar', 'app.myWork.MOM' , 'app.myWork' , 'app.profile'] , self.context['request'].user)

        return user
    def update (self, instance, validated_data):
        user = self.context['request'].user
        if user.is_staff or user.is_superuser:
            u = User.objects.get(username = self.context['request'].data['username'])
            if (u.is_staff and user.is_superuser ) or user.is_superuser: # superuser can change password for everyone , staff can change for everyone but not fellow staffs
                if 'password' in self.context['request'].data:
                    u.set_password(self.context['request'].data['password'])
                u.first_name = validated_data['first_name']
                u.last_name = validated_data['last_name']
                if 'is_active' in self.context['request'].data:
                    u.is_active = validated_data['is_active']
                if 'is_staff' in self.context['request'].data:
                    u.is_staff = validated_data['is_staff']
                u.save()
            else:
                raise PermissionDenied(detail=None)
        try:
            return u
        except:
            raise PermissionDenied(detail=None)

class groupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('pk' , 'name')
