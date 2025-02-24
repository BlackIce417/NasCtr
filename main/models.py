from django.db import models
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.utils.deconstruct import deconstructible
from django.conf import settings
import os
import hashlib
from datetime import datetime


# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Add more fields here as needed


class Album(models.Model):
    host = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100,)
    description = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建于')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新于')

    def __str__(self):
        return self.name
    
    
    def save(self, *args, **kwargs):
        # 先保存 Album 实例，以生成 ID
        super().save(*args, **kwargs)

        # 创建对应的文件夹
        album_folder = os.path.join(settings.MEDIA_ROOT, 'album', str(self.id))
        if not os.path.exists(album_folder):
            os.makedirs(album_folder)
    
    class Meta: 
        verbose_name = "相册"

def upload_to(instance, filename):
    # 路径格式：<appname>/static/media/album/<album_id>/<filename>
    return f'{instance._meta.app_label}/album/{instance.album.id}/{filename}'


@deconstructible
class HashUploadTo:
    def __call__(self, instance, filename):
        # 计算文件哈希
        file_path = os.path.join(instance._meta.app_label, 'album', str(instance.album.id), filename)
        
        # 计算文件内容的哈希值
        hash_value = self.get_file_hash(instance.image,)
        
        # 使用哈希值作为文件名
        file_extension = os.path.splitext(filename)[1]  # 获取文件扩展名
        return f'{instance._meta.app_label}/album/{instance.album.id}/{hash_value}{file_extension}'
    
    def get_file_hash(self, file,):
        """
        计算文件的哈希值
        """
        hash_sha256 = hashlib.sha256()  # 使用SHA-256算法
        hash_sha256.update(str(datetime.now()).encode("utf-8"))
        for chunk in file.chunks():  # 以块的方式读取文件内容
            hash_sha256.update(chunk)
        return hash_sha256.hexdigest()


class Picture(models.Model):
    name = models.CharField(max_length=100, verbose_name='图片名称')
    image = models.ImageField(upload_to=HashUploadTo(), verbose_name='图片')
    description = models.TextField(blank=True, null=True, verbose_name='Description')
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='photos', verbose_name='相册')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='上传于')

    def __str__(self):
        return self.name
    
    # def save(self, *args, **kwargs):
    #     if self.image:
    #         self.name = HashUploadTo().get_file_hash(self.image,)
    #     super().save(*args, **kwargs)

    class Meta:
        verbose_name = '图片'