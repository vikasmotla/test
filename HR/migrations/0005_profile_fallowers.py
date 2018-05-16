# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-05-16 04:06
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('HR', '0004_auto_20180510_1653'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='fallowers',
            field=models.ManyToManyField(blank=True, related_name='fallowUsers', to=settings.AUTH_USER_MODEL),
        ),
    ]