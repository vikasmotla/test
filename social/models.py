# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from time import time
from django.utils import timezone
import datetime
from allauth.socialaccount.signals import social_account_added
from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from django.contrib import admin

# Create your models here.


def getPostMediaAttachment(instance, filename):
    return 'social/postMedia/%s_%s' % (str(time()).replace('.', '_'), filename)


def getPostCommentMediaAttachment(instance, filename):
    return 'social/postCommentMedia/%s_%s' % (str(time()).replace('.', '_'), filename)

def getPostResponseMediaAttachment(instance, filename):
    return 'social/PostResponseMedia/%s_%s' % (str(time()).replace('.', '_'), filename)


class ProductTag(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    txt = models.CharField(max_length=300, null=True)


POST_TYPE_CHOICES = (
    ('Selling', 'Selling'),
    ('Buying', 'Buying'),
    ('Barter', 'Barter')
)


class Post(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, related_name="postUser", null=True)
    typ = models.CharField(max_length=20, choices=POST_TYPE_CHOICES, null=True)
    txt = models.CharField(null=True, max_length=3000)
    products = models.ManyToManyField(ProductTag, related_name='productPost', blank=True)
    approved = models.BooleanField(default=False)


POST_MEDIA_TYPE_CHOICES = (
    ('Image', 'Image'),
    ('ImageLink', 'ImageLink'),
    ('Video', 'Video'),
    ('VideoLink', 'VideoLink')
)


class PostMedia(models.Model):
    typ = models.CharField(max_length=20, choices=POST_MEDIA_TYPE_CHOICES, null=True)
    url = models.CharField(null=True, max_length=150)
    fil = models.FileField(upload_to=getPostMediaAttachment,  null=True)
    parent = models.ForeignKey(Post, related_name='mediaPost', null=True)


class PostLike(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, related_name="postLikeUser", null=True)
    parent = models.ForeignKey(Post, related_name='likes', null=True)
    typ = models.CharField(null=True, max_length=10)


class PostComment(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, related_name="postCommentUser", null=True)
    parent = models.ForeignKey(Post, related_name='comments', null=True)
    txt = models.CharField(null=True, max_length=1000)
    mention = models.ManyToManyField(User, related_name='mentionedUser', blank=True)
    replyTo = models.ForeignKey('self', related_name='replies', null=True)
    fil = models.FileField(upload_to=getPostCommentMediaAttachment,  null=True)


STATUS_TYPE_CHOICES = (
    ('ignored', 'ignored'),
    ('shortListed', 'shortListed'),
    ('finalized', 'finalized'),
)


class PostResponse(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, related_name="postResponseUser", null=True)
    txt = models.CharField(null=True, max_length=1000)
    parent = models.ForeignKey(Post, related_name='responses', null=True)
    value = models.PositiveIntegerField(null=True)
    typ = models.CharField(max_length=20, choices=POST_TYPE_CHOICES, null=True)
    status = models.CharField(max_length=20, choices=STATUS_TYPE_CHOICES, null=True)
    acknowledged = models.BooleanField(default=False)
    fil = models.FileField(upload_to=getPostResponseMediaAttachment,  null=True)
    reply = models.CharField(null=True, max_length=300)
