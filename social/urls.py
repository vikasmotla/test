from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()


router.register(r'productTag' , ProductTagViewSet , base_name ='productTag')
router.register(r'post' , PostViewSet , base_name ='post')
router.register(r'postMedia' , PostMediaViewSet , base_name ='postMedia')
router.register(r'postLike' , PostLikeViewSet , base_name ='postLike')
router.register(r'postComment' , PostCommentViewSet , base_name ='postComment')
router.register(r'postResponse' , PostResponseViewSet , base_name ='postResponse')

urlpatterns = [
    url(r'^', include(router.urls)),
]
