# Generated by Django 3.0.4 on 2020-07-21 03:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0014_remove_extendedusers_email'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='extendedusers',
            name='user',
        ),
    ]