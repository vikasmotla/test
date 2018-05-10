from django.db import models
from django.contrib.auth.models import User, Group
from time import time
from django.utils import timezone
import datetime
from allauth.socialaccount.signals import social_account_added
from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from django.contrib import admin
from social.models import ProductTag


def getDisplayPicturePath(instance , filename):
    return 'HR/images/DP/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getCoverPicturePath(instance , filename):
    return 'HR/images/DP/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)


AUTH_TYPE_CHOICES = (
    ('linklogin' , 'linklogin'),
    ('otp' , 'otp')
)

class AuthToken(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user = models.ForeignKey(User , related_name="auth" , null = False)
    key = models.CharField(max_length = 200 , null = True)
    otp = models.PositiveIntegerField(null=True)
    typ = models.CharField(max_length = 20 , choices = AUTH_TYPE_CHOICES)
    valid = models.BooleanField(default = False)
    expiresOn = models.DateTimeField(default=timezone.now)

class profile(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user = models.OneToOneField(User)
    displayPicture = models.ImageField(upload_to = getDisplayPicturePath , null=True)
    coverPicture = models.ImageField(upload_to = getCoverPicturePath , null=True)
    email = models.EmailField(max_length = 50 , null = True)
    mobile = models.CharField(null = True , max_length = 14)
    website = models.URLField(max_length = 100 , null = True , blank = True)
    cin = models.CharField(max_length=300 , null = True)
    year_established = models.CharField(max_length=300 , null = True)
    street = models.CharField(max_length=300 , null = True)
    city = models.CharField(max_length=100 , null = True)
    state = models.CharField(max_length=50 , null = True)
    pincode = models.PositiveIntegerField(null = True)
    country = models.CharField(max_length = 50 , null = True , default = 'India')
    lat = models.CharField(max_length=15 ,null = True)
    lon = models.CharField(max_length=15 ,null = True)
    sellingProduct = models.ManyToManyField(ProductTag , related_name = 'productSale' , blank = True)
    buyingProduct = models.ManyToManyField(ProductTag , related_name = 'productBuy' , blank = True)
    messageAlert = models.BooleanField(default = True)
    requestAlert = models.BooleanField(default = True)
    periodicNotification = models.BooleanField(default = True)
    newsletter = models.BooleanField(default = True)
    promotional = models.BooleanField(default = True)

User.profile = property(lambda u : profile.objects.get_or_create(user = u)[0])

class Office(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    parent = models.ForeignKey(profile ,related_name='profile',null=True)
    name = models.CharField(max_length=100 , null = True)
    street = models.CharField(max_length=300 , null = True)
    city = models.CharField(max_length=100 , null = True)
    state = models.CharField(max_length=50 , null = True)
    pincode = models.PositiveIntegerField(null = True)
    country = models.CharField(max_length = 50 , null = True , default = 'India')
    lat = models.CharField(max_length=15 ,null = True)
    lon = models.CharField(max_length=15 ,null = True)
    contactName = models.CharField(max_length=50 , null = True)
    contactNumber = models.CharField(null = True , max_length = 14)
    gstIn = models.CharField(null = True , max_length = 10)
    licenceNumber = models.CharField(null = True , max_length = 20)


@receiver(user_signed_up, dispatch_uid="user_signed_up")
def user_signed_up_(request, user, **kwargs):
    user.username = user.email+str(user.pk)
    user.save()
