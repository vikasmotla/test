from __future__ import unicode_literals
from django.contrib.auth.models import User, Group
from time import time
from django.db import models
from django.contrib import admin
# Create your models here.

def getERPPictureUploadPath(instance , filename ):
    return 'ERP/pictureUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

def getZonesPictureUploadPath(instance , filename ):
    return 'ERP/pictureUploads/%s_%s' % (str(time()).replace('.', '_'), filename)

def getPicPath(instance , filename ):
    return 'ERP/eventPic/%s_%s' % (str(time()).replace('.', '_'), filename)


class application(models.Model):
    # each application in a module will have an instance of this model
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 50 , null = False , unique = True)
    icon = models.CharField(max_length = 20 , null = True )
    haveCss = models.BooleanField(default = True)
    haveJs = models.BooleanField(default = True)
    inMenu = models.BooleanField(default = True)
    description = models.CharField(max_length = 500 , null = False)
    def __unicode__(self):
        return self.name

class appSettingsField(models.Model):
    FIELD_TYPE_CHOICES = (
        ('flag' , 'flag'),
        ('value' , 'value')
    )
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 50 , null = False )
    flag = models.BooleanField(default = False)
    value = models.CharField(max_length = 5000 , null = True)
    description = models.CharField(max_length = 500 , null = False)
    fieldType = models.CharField(choices = FIELD_TYPE_CHOICES , default = 'flag' , null = False , max_length = 5)
    def __unicode__(self):
        return self.name
    class Meta:
        unique_together = ('name',)

class permission(models.Model):
    app = models.ForeignKey(application , null=False)
    user = models.ForeignKey(User , related_name = "accessibleApps" , null=False)
    givenBy = models.ForeignKey(User , related_name = "approvedAccess" , null=False)
    created = models.DateTimeField(auto_now_add = True)
    def __unicode__(self):
        return self.app.name

class groupPermission(models.Model):
    app = models.ForeignKey(application , null=False)
    group = models.ForeignKey(Group , related_name = "accessibleApps" , null=False)
    givenBy = models.ForeignKey(User , related_name = "approvedGroupAccess" , null=False)
    created = models.DateTimeField(auto_now_add = True)
    def __unicode__(self):
        return self.app

MEDIA_TYPE_CHOICES = (
    ('onlineVideo' , 'onlineVideo'),
    ('video' , 'video'),
    ('image' , 'image'),
    ('onlineImage' , 'onlineImage'),
    ('doc' , 'doc'),
)

class media(models.Model):
    user = models.ForeignKey(User , related_name = 'serviceDocsUploaded' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    link = models.TextField(null = True , max_length = 300) # can be youtube link or an image link
    attachment = models.FileField(upload_to = getERPPictureUploadPath , null = True ) # can be image , video or document
    mediaType = models.CharField(choices = MEDIA_TYPE_CHOICES , max_length = 10 , default = 'image')

class address(models.Model):
    street = models.CharField(max_length=300 , null = True)
    city = models.CharField(max_length=100 , null = True)
    state = models.CharField(max_length=50 , null = True)
    pincode = models.PositiveIntegerField(null = True)
    lat = models.CharField(max_length=15 ,null = True)
    lon = models.CharField(max_length=15 ,null = True)
    country = models.CharField(max_length = 50 , null = True)

    def __unicode__(self):
        return '< street :%s>,<city :%s>,<state :%s>' %(self.street ,self.city, self.state)

class Events(models.Model):
    created = models.DateTimeField(auto_now_add=True,null=True)
    updated = models.DateTimeField(auto_now=True,null=True)
    name = models.CharField(max_length = 200 , null = True )
    event_On = models.DateTimeField(null = True)
    event_ends_On = models.DateTimeField(null = True)
    regEndsOn = models.DateTimeField(null = True)
    venue = models.CharField(max_length = 200 , null = True )
    entryFee = models.FloatField(null=True)
    description = models.CharField(max_length = 30000 , null = True )
    venueGMapUrl = models.CharField(max_length = 1000 , null = True )
    promoted = models.BooleanField(default = False)

EVENTITEM_TYPE_CHOICES = (
    ('KeyNote' , 'KeyNote'),
    ('Session' , 'Session'),
    ('WorkShop' , 'WorkShop'),
    ('Tea' , 'Tea'),
    ('Lunch' , 'Lunch'),
    ('Dinner' , 'Dinner'),
    ('Network' , 'Network')
)

class EventItem(models.Model):
    event = models.ForeignKey(Events, related_name='eventItemParent' , null=True)
    title = models.CharField(max_length = 300 , null = True )
    typ = models.CharField(choices = EVENTITEM_TYPE_CHOICES , max_length = 20 ,null = True)
    description = models.CharField(max_length = 10000 , null = True )
    pic = models.ImageField(upload_to = getPicPath , null=True)
    entryFee = models.FloatField(null=True)
    moderator = models.CharField(max_length = 200 , null = True )
    dayNumber = models.PositiveIntegerField(null = True)
    eventTime = models.CharField(max_length = 15 , null = True )

class EventRegistration(models.Model):
    event = models.ForeignKey(Events, related_name='registrations' , null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length = 100 , null = True )
    email = models.EmailField(max_length = 50 , null = True)
    phoneNumber = models.CharField(null = True , max_length = 14)
    regId = models.CharField(null = True , max_length = 20)
    payAmount = models.FloatField(null=True)
    payMode = models.CharField(null = True , max_length = 20)
    payDate = models.DateTimeField(null = True)
    payRefference = models.CharField(null = True , max_length = 50)
    cancelReg = models.BooleanField(default = False)
