from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *


class ProductTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTag
        fields = ('pk' , 'txt')


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('pk' , 'user','typ','txt','products','approved')

class PostMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ('pk' , 'typ','url','fil','parent')

class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ('pk' , 'user','parent')

class PostCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ('pk' , 'user','parent','txt','mention','replyTo')

class PostResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostResponse
        fields = ('pk' , 'user','txt','parent')
