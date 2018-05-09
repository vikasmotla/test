from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'application' , applicationViewSet , base_name = 'application')
router.register(r'appSettings' , applicationSettingsViewSet , base_name = 'applicationSettings')
router.register(r'appSettingsAdminMode' , applicationSettingsAdminViewSet , base_name = 'applicationSettingsAdminMode')
router.register(r'groupPermission' , groupPermissionViewSet , base_name = 'groupAccess')
router.register(r'permission' , permissionViewSet , base_name = 'access')
router.register(r'address' , addressViewSet , base_name = 'address')
router.register(r'media' , MediaViewSet , base_name = 'media')
router.register(r'event' , EventsViewSet , base_name = 'event')
router.register(r'eventItem' , EventItemViewSet , base_name = 'eventItem')
router.register(r'eventRegistration' , EventRegistrationViewSet , base_name = 'eventRegistration')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'sendSMS/$' , SendSMSApi.as_view()),
    url(r'eventRegDetails/$' , eventRegDetailsApi.as_view()),
]
