from __future__ import absolute_import

from celery import shared_task
from celery.task.schedules import crontab
from celery.decorators import periodic_task
from celery.utils.log import get_task_logger
from datetime import datetime

logger = get_task_logger(__name__)

from .models import *


@shared_task
def add(x, y):
    print x, y
    return x + y



# A periodic task that will run every minute (the symbol "*" means every)
@periodic_task(run_every=(crontab(hour="16", minute="52", day_of_week="*")))
def scraper_example():
    logger.info("Start task")
    now = datetime.now()
    print "called the add function"
    print appSettingsField.objects.all()
    print "in  the periodic declation"
