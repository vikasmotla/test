# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-05-03 05:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PIM', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='domain',
            field=models.CharField(choices=[(b'System', b'System'), (b'Administration', b'Administration'), (b'Application', b'Application')], default=b'System', max_length=3),
        ),
    ]
