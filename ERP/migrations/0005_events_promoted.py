# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-05-04 04:03
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ERP', '0004_eventitem_event'),
    ]

    operations = [
        migrations.AddField(
            model_name='events',
            name='promoted',
            field=models.BooleanField(default=False),
        ),
    ]
