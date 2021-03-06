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
from .serializers import *
from API.permissions import *
from ERP.models import *
from ERP.views import getApps
from django.db.models import Q
from django.http import JsonResponse
import random, string
from django.utils import timezone
from rest_framework.views import APIView
from PIM.models import blogPost
import sys, traceback



def index(request):
    return render(request, 'index.html', {"home": True , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})


def blogDetails(request, blogname):
    print '*****************',blogname
    # try:
    blogobj = blogPost.objects.get(shortUrl=blogname)
    if blogobj.contentType == 'article':
        print 'article'
        us = ''
        blogId = blogobj.pk
        count = 0
        for j in blogobj.users.all():
            if count == 0:
                us = j.first_name + ' ' + j.last_name
            else:
                us += ' , ' + j.first_name + ' ' + j.last_name
            count += 1
        blogobj.created = blogobj.created.replace(microsecond=0)
        return render(request, 'blogdetails.html', {"home": False, "tagsCSV" :  blogobj.tagsCSV.split(',') , 'user': us, 'blogobj' : blogobj , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})
    elif blogobj.contentType == 'book':
        book = Book.objects.get(pk=blogobj.header)
        sectionobj = Section.objects.filter(book = book.pk)
        return render(request, 'bookDetails.html', {"home": False, "tagsCSV" :  blogobj.tagsCSV.split(','), 'book' : book ,'sectionobj':sectionobj,'blogobj' : blogobj, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})
    # except:
    #
    #     traceback.print_exc(file=sys.stdout)
    #     sectionobj = Section.objects.get(shortUrl=blogname)
    #     blogobj = blogPost.objects.get(header=sectionobj.book.pk)
    #     print 'boookkkkkk',sectionobj.book
    #     sec = sectionobj.book.sections.order_by('sequence')
    #     prev = False
    #     nxt = False
    #     prevobj={}
    #     nxtvobj={}
    #     for a,i in enumerate(sec):
    #         print i.shortUrl , a
    #         if i.pk == sectionobj.pk:
    #             if len(sec) > 1:
    #                 if a == 0:
    #                     nxt = True
    #                     nxtvobj = sec[1]
    #                     print 'nxt',nxtvobj.shortUrl
    #                 elif a == len(sec)-1:
    #                     prev = True
    #                     prevobj = sec[a-1]
    #                     print 'prev',prevobj.shortUrl
    #                 else:
    #                     prev = True
    #                     nxt = True
    #                     prevobj = sec[a-1]
    #                     nxtvobj = sec[a+1]
    #
    #     return render(request, 'sectionDetails.html', { "sections" : sec , "home": False, "tagsCSV" :  blogobj.tagsCSV.split(','),'sectionobj':sectionobj, 'book' : sectionobj.book ,'blogobj' : blogobj, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT,'questions':sectionobj.questions.all(),'bot':{'prev':prev,'nxt':nxt,'prevobj':prevobj,'nxtvobj':nxtvobj}})





def blog(request):

    blogObj = blogPost.objects.filter(contentType='article').order_by('-created')
    pagesize = 6
    try:
        page = int(request.GET.get('page', 1))
    except ValueError as error:
        page = 1
    total = blogObj.count()
    last = total/pagesize + (1 if total%pagesize !=0 else 0)
    # data = blogObj[(page-1)*pagesize:(page*pagesize)]
    pages = {'first':1,
			'prev':(page-1) if page >1 else 1,
			'next':(page+1) if page !=last else last,
			'last':last,
			'currentpage':page}

    data = [ ]
    for i in blogObj:
        title = i.title
        header = i.header
        us = ''
        blogId = i.pk
        for j in i.users.all():
            us = j.first_name + ' ' + j.last_name
        date = i.created
        # body = i.source
        data.append({'user':us , 'header' : header , 'title' : title , 'date' : date , 'blogId' : blogId , 'url' : i.shortUrl })
    data = data[(page-1)*pagesize:(page*pagesize)]

    return render(request,"blog.html" , {"home" : False ,'data' : data, 'dataLen' : len(data) ,'pages':pages , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def events(request):
    print 'cameeeeeeeeeeeeeeeeeeeee'
    eventObj = Events.objects.all().order_by('-event_On')
    pagesize = 2
    try:
        page = int(request.GET.get('page', 1))
    except ValueError as error:
        page = 1
    print '*****************',eventObj
    total = eventObj.count()
    last = total/pagesize + (1 if total%pagesize !=0 else 0)
    # data = blogObj[(page-1)*pagesize:(page*pagesize)]
    pages = {'first':1,
			'prev':(page-1) if page >1 else 1,
			'next':(page+1) if page !=last else last,
			'last':last,
			'currentpage':page}
    data = [ ]
    for i in eventObj:
        print i.name
        title = i.name
        header = i.description
        eventId = i.pk
        as_on = i.event_On
        ends_on = i.event_ends_On
        shortUrl = i.name.replace(' ','_') + '_' + str(i.pk)
        data.append({'header' : header , 'title' : title , 'as_on' : as_on ,'ends_on':ends_on, 'eventId' : eventId , 'url' : shortUrl })
    data = data[(page-1)*pagesize:(page*pagesize)]
    return render(request,"events.html" , {"home" : False ,'data' : data, 'dataLen' : len(data) ,'pages':pages , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def eventDetails(request, eventName):
    print '*****************@@@@@@@@@@@@@@@',eventName,type(eventName),request.method
    eventPk = eventName.split('_')[-1]
    print eventPk,type(eventPk)
    eventobj = Events.objects.get(id=int(eventPk))
    print 'events Item'
    eventItemObj = EventItem.objects.filter(event = eventobj.pk)
    eventDays = []
    eventItemData = []
    for i in  eventItemObj:
        if i.dayNumber in eventDays:
            eventItemData[eventDays.index(i.dayNumber)][str(i.dayNumber)].append(i)
        else:
            eventDays.append(i.dayNumber)
            eventItemData.append({str(i.dayNumber):[]})
            eventItemData[eventDays.index(i.dayNumber)][str(i.dayNumber)].append(i)
    print eventItemData

    if request.method == 'POST':
        eventCheck = EventRegistration.objects.filter(event = eventobj.pk)
        print request.POST['name'],request.POST['email'],request.POST['phone'],
        print len(request.POST['name']),len(request.POST['email']),len(request.POST['phone']),
        for i in eventCheck:
            if request.POST['email'] == i.email:
                print 'thereeeeeeeeeeeeeeeeee'
                messages.error(request, "Sorry This email has already registered for this event")
                return render(request, 'eventdetails.html', {"home": False,'eventobj' : eventobj , 'eventItemData' : eventItemData, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})
        print 'not thereeeeeeeeeeeeeeee'
        data = {
        'name' : request.POST['name'],
        'email' : request.POST['email'],
        'phoneNumber' : request.POST['phone'],
        'event' : eventobj
        }
        print 'dddddddddddddddddd',data
        EventRegistration.objects.create(**data)
        messages.success(request, "You have successfully Registered")
        return render(request, 'eventdetails.html', {"home": False,'eventobj' : eventobj , 'eventItemData' : eventItemData, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})
    else:
        if 'register' in request.GET:
            preOpen = True
        else:
            preOpen = False

        return render(request, 'eventdetails.html', {"preOpen" : preOpen ,  "home": False,'eventobj' : eventobj , 'eventItemData' : eventItemData, "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def news(request):
    return render(request,"newssection.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def team(request):
    return render(request,"team.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def career(request):
    return render(request,"career.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def policy(request):
    return render(request,"policy.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME , "site" : globalSettings.SITE_ADDRESS , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def terms(request):
    return render(request,"terms.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME  , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def refund(request):
    return render(request,"refund.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def contacts(request):
    return render(request,"contacts.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})


def desclaimer(request):
    return render(request,"desclaimer.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})


def registration(request):
    return render(request,"registration.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})


class RegistrationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegistrationSerializer
    queryset = Registration.objects.all()
