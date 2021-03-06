"""
Django settings for libreERP project.

Generated by 'django-admin startproject' using Django 1.8.5.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
from django.contrib.messages import constants as messages
from celery import Celery

MESSAGE_TAGS = {
    messages.ERROR: 'danger'
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


SITE_ADDRESS = 'http://127.0.0.1:8000' # the url prefix of the site

ROOT_APP = 'ERP' # the default app

LOGIN_PAGE_IMAGE = '/static/images/bioTechBanner.jpg'


LOGIN_URL = 'login' # this can be 'login' or 'account_login'
REGISTER_URL = 'register' # this can be 'register' or 'account_signup'
LOGIN_TEMPLATE = 'loginCenter.html'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'apfwdssalfeag7)cp4jve5gfb%l8wbn4cyvym(tez^m@z1o#3f'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['cioc.co.in', 'localhost', '127.0.0.1']


LOGIN_REDIRECT = 'social' # the url to which the user will be redirected once successfully loggedin
# Options are : ERP , ecommerce , blogs , corporate

LOGOUT_REDIRECT = 'root' # similarly the url to which the user will be directed one logged out

USE_CDN = False # when turned on the application will use the cndjs.com and other similar
#content delivery network for css and jss libraries
# Application definition
BRAND_NAME = 'yomilio'

BRAND_LOGO = '/static/images/yo_icon.svg'
BRAND_LOGO_INVERT = '/static/images/yo_icon.svg'

SMS_API_PREFIX = "http://sms.azmobia.com/http-api.php?username=CIOC&password=cioc567&senderid=CIOCPL&route=1&"

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'rest_framework',
    'corsheaders',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
    'robots',
    'API', # uncategorised REST points
    'ERP', # permissions, overall management of the platform
    'HR', # people aspect of the platform
    'homepage', # landing page
    'djcelery',
    'PIM',
    'social'
)

SITE_ID = 1

ACCOUNT_ADAPTER = 'ERP.views.AccountAdapter'

SOCIALACCOUNT_PROVIDERS = \
        {'google':
            { 'SCOPE': ['profile', 'email'],
            'AUTH_PARAMS': { 'access_type': 'online' } },
        'facebook':
            {'METHOD': 'oauth2',
            'SCOPE': ['email', 'public_profile', 'user_friends'],
            'AUTH_PARAMS': {'auth_type': 'reauthenticate'},
            'FIELDS': [
                'id',
                'email',
                'name',
                'first_name',
                'last_name',
                'verified',
                'locale',
                'timezone',
                'link',
                'gender',
                'updated_time'],
            'EXCHANGE_TOKEN': True,
            'LOCALE_FUNC': lambda request: 'en_US',
            'VERIFIED_EMAIL': False,
            'VERSION': 'v2.4'}
        }

ACCOUNT_USER_MODEL_USERNAME_FIELD = 'email'
ACCOUNT_EMAIL_REQUIRED = False
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'username'
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = False

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'API.middleware.simple_middleware',
)

ROOT_URLCONF = 'yomilio.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'HR', 'templates'),
            os.path.join(BASE_DIR, 'yomilio', 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'yomilio.wsgi.application'


AUTHENTICATION_BACKENDS = (
    'allauth.account.auth_backends.AuthenticationBackend',
    'django.contrib.auth.backends.ModelBackend',
)


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db_2.sqlite3'),
    }
}

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'django',
#         'USER': 'root',
#         'PASSWORD': 'password',
#         'HOST': '127.0.0.1',   # Or an IP Address that your DB is hosted on
#         'PORT': '3306',
#     }
# }


# AUTH_PROFILE_MODULE = 'HR.userProfile'
# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_L10N = True

USE_TZ = True

EMAIL_HOST_SUFFIX = '24tutors.com'
EMAIL_HOST = 'email.cioc.in'
EMAIL_HOST_USER = 'do_not_reply@24tutors.com'
EMAIL_HOST_PASSWORD = '51GX4]N1_0uw'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'do_not_reply@24tutors.com'
# DEFAULT_FROM_EMAIL = 'do_not_reply@cioc.co.in'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'

CORS_ORIGIN_ALLOW_ALL = False

CORS_ALLOW_HEADERS = (
    'x-requested-with',
    'content-type',
    'accept',
    'origin',
    'authorization',
    'X-CSRFToken'
)

CORS_ALLOW_CREDENTIALS = True

STATIC_ROOT = (
    os.path.join(BASE_DIR , 'static_root')
)
STATICFILES_DIRS = (
   os.path.join(BASE_DIR , 'static_shared'),
)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR , 'media_root')

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'DEFAULT_METADATA_CLASS': 'rest_framework.metadata.SimpleMetadata',
    # 'DEFAULT_RENDERER_CLASSES': ('rest_framework.renderers.JSONRenderer',),
}

CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'
CELERYBEAT_SCHEDULER = 'djcelery.schedulers.DatabaseScheduler'

WAMP_SERVER = 'cioc.co.in'
