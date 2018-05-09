from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from HR.views import loginView , logoutView , home , registerView , tokenAuthentication , root, generateOTP
from homepage.views import *
from social.views import *

urlpatterns = [
    url(r'^$', index , name ='root'),
    url(r'social$', socialIndex , name ='social'),
    url(r'social/messages', socialMessage , name ='message'),
    url(r'social/profile/(?P<profName>[\w|\W]+)', profileDetails , name ='profileDetails'),
    url(r'^ERP/', home , name ='ERP'),
    url(r'^api/', include('API.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login', loginView , name ='login'),
    # url(r'^register', registerView , name ='register'),
    url(r'^token', tokenAuthentication , name ='tokenAuthentication'),
    url(r'^logout/', logoutView , name ='logout'),
    url(r'^api-auth/', include('rest_framework.urls', namespace ='rest_framework')),
    url(r'^robots\.txt', include('robots.urls')),
    url(r'^generateOTP', generateOTP, name="generateOTP"),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^register', registration , name ='register'),
    url(r'^career', career , name ='career'),
    url(r'^contacts', contacts , name ='contacts'),
    url(r'^team', team , name ='team'),
    url(r'^blog/$', blog , name ='blog'),
]

if settings.DEBUG:
    urlpatterns +=static(settings.STATIC_URL , document_root = settings.STATIC_ROOT)
    urlpatterns +=static(settings.MEDIA_URL , document_root = settings.MEDIA_ROOT)

urlpatterns.append(url(r'^(?P<blogname>[\w|\W]+)/', blogDetails , name ='blogDetails'))
