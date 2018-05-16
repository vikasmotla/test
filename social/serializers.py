from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
import re
from HR.models import *


class ProductTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTag
        fields = ('pk' , 'txt')

class userSampleProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = profile
        fields = ('displayPicture' ,'pk' )

class userSampleSerializer(serializers.ModelSerializer):
    profile = userSampleProfileSerializer(many=False , read_only=True)
    class Meta:
        model = User
        fields = ( 'pk', 'username' , 'first_name' , 'last_name' , 'profile'  , 'date_joined')

class PostMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ('pk' , 'typ','url','fil','parent')
    def create(self , validated_data):
        p = PostMedia(**validated_data)
        p.parent = Post.objects.get(pk = self.context['request'].data['parent'])
        p.save()
        return p

class PostCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ('pk' , 'user','parent','txt','mention','replyTo' ,'fil')
    def create(self , validated_data):
        del validated_data['mention']
        print '##################33',validated_data
        p = PostComment(**validated_data)
        p.user = self.context['request'].user
        p.parent = Post.objects.get(pk = self.context['request'].data['parent'])
        p.save()
        return p

class PostSerializer(serializers.ModelSerializer):
    # user = userSampleSerializer(many = False , read_only = True)
    mediaPost = PostMediaSerializer(many= True ,read_only = True)
    comments = PostCommentSerializer(many= True ,read_only = True)
    class Meta:
        model = Post
        fields = ('pk' , 'user','typ','txt','products','approved','created','updated' ,'mediaPost','comments')
        read_only_fields = ( 'created' , 'updated' )
    def create(self , validated_data):
        p = Post(**validated_data)
        p.user = self.context['request'].user
        if re.search('sell', p.txt, re.IGNORECASE |re.MULTILINE):
            p.typ = 'Selling'
        elif re.search('buy', p.txt, re.IGNORECASE | re.MULTILINE):
            p.typ = 'Buying'
        elif re.search('barter', p.txt, re.IGNORECASE | re.MULTILINE):
            p.typ = 'Buying'
        p.save()
        return p



class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ('pk' , 'user','parent')



class PostResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostResponse
        fields = ('pk' , 'user','txt','parent')
