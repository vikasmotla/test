# -*- coding: utf-8 -*-
from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect , get_object_or_404
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation
from django.views.decorators.csrf import csrf_exempt, csrf_protect
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from API.permissions import *
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
from .models import *
from .serializers import *
from HR.models import profile

# Create your views here.

def socialIndex(request):
    return render(request, 'app.social.index.html', {"home": True , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def socialMessage(request):
    return render(request, 'app.social.messages.html', {"home": True , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def profileDetails(request,profName):
    print 'proffffffffffffffffffffff',profName
    userObj = User.objects.get(username=profName)
    profileObj = profile.objects.get(user = userObj.pk)
    print profileObj,profileObj.mobile
    return render(request, 'app.social.profile.html', {"home": True ,'profileObj':profileObj, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

class ProductTagViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = ProductTagSerializer
    queryset = ProductTag.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['txt' ,]

class PostViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = PostSerializer
    queryset = Post.objects.all()

class PostMediaViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = PostMediaSerializer
    queryset = PostMedia.objects.all()

class PostLikeViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = PostLikeSerializer
    queryset = PostLike.objects.all()

class PostCommentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = PostCommentSerializer
    queryset = PostComment.objects.all()

class PostResponseViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = PostResponseSerializer
    queryset = PostResponse.objects.all()
