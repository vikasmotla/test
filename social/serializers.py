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

class UserSampleProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = profile
        fields = ('displayPicture' ,'pk' )

class userSampleSerializer(serializers.ModelSerializer):
    profile = UserSampleProfileSerializer(many=False , read_only=True)
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
        fields = ('pk' , 'user','parent','txt','mention','replyTo' ,'fil', 'created')
    def create(self , validated_data):
        del validated_data['mention']
        print '##################33',validated_data
        p = PostComment(**validated_data)
        p.user = self.context['request'].user
        p.parent = Post.objects.get(pk = self.context['request'].data['parent'])
        p.save()
        return p

class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ('pk' , 'user','parent','typ')
    def create(self , validated_data):
        p = PostLike(**validated_data)
        p.user = self.context['request'].user
        p.parent = Post.objects.get(pk = self.context['request'].data['parent'])
        p.save()
        return p


class PostResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostResponse
        fields = ('pk' ,'created', 'user','txt','parent','value','typ','status','acknowledged','fil','reply')
    def create(self , validated_data):
        p = PostResponse(**validated_data)
        p.user = self.context['request'].user
        p.parent = Post.objects.get(pk = self.context['request'].data['parent'])
        p.save()
        return p


class PostSerializer(serializers.ModelSerializer):
    responses = PostResponseSerializer(many = True , read_only = True)
    likes_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    like_pk = serializers.SerializerMethodField()
    mediaPost = PostMediaSerializer(many= True ,read_only = True)
    comments = PostCommentSerializer(many= True ,read_only = True)
    # likes = PostLikeSerializer(many= True ,read_only = True)
    class Meta:
        model = Post
        fields = ('pk' , 'user','typ','txt','products','approved','created','updated' ,'mediaPost','comments','likes_count','user_reaction','like_pk', 'responses')
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

    def get_likes_count(self, obj):
        return obj.likes.count()
    def get_user_reaction(self, obj):
        pl=obj.likes.filter(user= self.context['request'].user)
        if len(pl) > 0:
            typ = pl[0].typ
        else:
            typ = ''
        return typ
    def get_like_pk(self, obj):
        pl=obj.likes.filter(user= self.context['request'].user)
        if len(pl) > 0:
            likePk = pl[0].pk
        else:
            likePk = 0
        return likePk





class PostLiteSerializer(serializers.ModelSerializer):
    responses = PostResponseSerializer(many = True , read_only = True)
    class Meta:
        model = Post
        fields = ('pk' , 'user','typ','txt' , 'responses')
