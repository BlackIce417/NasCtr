# Generated by Django 5.0.10 on 2025-03-31 15:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0012_rename_tags_picture_tag'),
    ]

    operations = [
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=100, null=True, verbose_name='视频名称')),
                ('video', models.FileField(upload_to='videos/', verbose_name='视频文件')),
                ('album', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='videos', to='main.album', verbose_name='相册')),
            ],
        ),
    ]
