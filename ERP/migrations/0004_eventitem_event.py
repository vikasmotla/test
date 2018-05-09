# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-05-03 11:16
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ERP', '0003_auto_20180503_1549'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventitem',
            name='event',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='eventItemParent', to='ERP.Events'),
        ),
    ]
