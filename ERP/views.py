from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
import requests
from allauth.account.adapter import DefaultAccountAdapter


class AccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        return globalSettings.ON_REGISTRATION_SUCCESS_REDIRECT

class SendSMSApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        print "came"
        if 'number' not in request.data or 'text' not in request.data:
            return Response(status = status.HTTP_400_BAD_REQUEST)
        else:
            url = globalSettings.SMS_API_PREFIX + 'number=%s&message=%s'%(request.data['number'] , request.data['text'])
            # print url
            requests.get(url)
            return Response(status = status.HTTP_200_OK)


class addressViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = addressSerializer
    def get_queryset(self):
        u = self.request.user
        return address.objects.all()

class registerDeviceApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        if 'username' in request.data and 'password' in request.data and 'sshKey' in request.data:
            sshKey = request.data['sshKey']
            deviceName =sshKey.split()[2]
            mode = request.data['mode']
            print sshKey
            user = authenticate(username =  request.data['username'] , password = request.data['password'])
            if user is not None:
                if user.is_active:
                    d , n = device.objects.get_or_create(name = deviceName , sshKey = sshKey)
                    gp , n = profile.objects.get_or_create(user = user)
                    if mode == 'logout':
                        print "deleted"
                        gp.devices.remove(d)
                        d.delete()
                        generateGitoliteConf()
                        return Response(status=status.HTTP_200_OK)
                    gp.devices.add(d)
                    gp.save()
                    generateGitoliteConf()
            else:
                raise NotAuthenticated(detail=None)
            return Response(status=status.HTTP_200_OK)
        else:
            raise ValidationError(detail={'PARAMS' : 'No data provided'} )

def getApps(user):
    aa = []
    for a in user.accessibleApps.all().values('app'):
        aa.append(a['app'])
    return application.objects.filter(pk__in = aa)

class applicationViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly,)
    serializer_class = applicationSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
    def get_queryset(self):
        u = self.request.user
        if not u.is_superuser:
            return getApps(u)
        else:
            if 'user' in self.request.GET:
                return getApps(User.objects.get(username = self.request.GET['user']))
            return application.objects.filter(inMenu = True)



class applicationSettingsViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly , )
    queryset = appSettingsField.objects.all()
    serializer_class = applicationSettingsSerializer

class applicationSettingsAdminViewSet(viewsets.ModelViewSet):
    # permission_classes = (isAdmin,)
    queryset = appSettingsField.objects.all()
    serializer_class = applicationSettingsAdminSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['app' , 'name']


class groupPermissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = groupPermission.objects.all()
    serializer_class = groupPermissionSerializer

class permissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = permission.objects.all()
    serializer_class = permissionSerializer

class MediaViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = media.objects.all()
    serializer_class = MediaSerializer

class EventsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = EventsSerializer
    queryset = Events.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name',]

class EventItemViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = EventItemSerializer
    queryset = EventItem.objects.all()

class EventRegistrationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = EventRegistrationSerializer
    queryset = EventRegistration.objects.all()
