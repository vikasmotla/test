# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-05-18 11:52
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('PIM', '0002_auto_20180503_1048'),
        ('ERP', '0008_eventregistration_event'),
    ]

    operations = [
        migrations.CreateModel(
            name='FeaturedPage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('active', models.BooleanField(default=False)),
                ('typ', models.CharField(choices=[('person', 'person'), ('event', 'event'), ('blog', 'blog')], max_length=10, null=True)),
                ('blog', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='featuredPageblog', to='PIM.blogPost')),
                ('event', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='featuredPageEvent', to='ERP.Events')),
                ('person', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='featuredPage', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]