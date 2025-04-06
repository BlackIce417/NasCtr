import shutil
from django.db import models
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.forms import ValidationError
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
    cover = models.ForeignKey('Picture', on_delete=models.SET_NULL, blank=True, null=True, related_name='cover_for', verbose_name='封面')
    cover_type = models.CharField(choices=[('default', '默认封面'), ('custom', '自定义封面')], default='default', max_length=10, verbose_name='封面类型')
    
    def __str__(self):
        return self.name
    
    
    def save(self, *args, **kwargs):
        # 先保存 Album 实例，以生成 ID
        super().save(*args, **kwargs) 

        # 创建对应的文件夹
        album_folder = os.path.join(settings.MEDIA_ROOT, 'main/album', str(self.id))
        if not os.path.exists(album_folder):
            os.makedirs(album_folder)

        if self.cover:
            if self.cover.album != self:
                raise ValidationError("封面图片必须是本相册中的图片。")
        elif not self.cover:
            default_cover_path_jpg = os.path.join(settings.MEDIA_ROOT, 'main/album/default', 'default_cover.jpg')
            default_cover_path_png = os.path.join(settings.MEDIA_ROOT, 'main/album/default', 'default_cover.png')
            if os.path.exists(default_cover_path_jpg):
                self.cover = Picture.objects.create(image='main/album/default/default_cover.jpg', name='默认封面', album=self, picture_type="default_cover")
                super().save(update_fields=["cover"])
            elif os.path.exists(default_cover_path_png):
                self.cover = Picture.objects.create(image='main/album/default/default_cover.png', name='默认封面', album=self, picture_type="default_cover")
                super().save(update_fields=["cover"])
            else:
                raise ValidationError("默认封面图片丢失。")
            
    def delete(self, using=None, keep_parents=False):
        album_folder = os.path.join(settings.MEDIA_ROOT, 'main/album', str(self.id))
        if os.path.exists(album_folder):
            shutil.rmtree(album_folder)
        Picture.objects.filter(album=self, picture_type="default_cover").delete()
        return super().delete(using, keep_parents)
    
    class Meta: 
        verbose_name = "相册"

# def upload_to(instance, filename):
#     # 路径格式：<appname>/static/media/album/<album_id>/<filename>
#     return f'{instance._meta.app_label}/album/{instance.album.id}/{filename}'


@deconstructible
class HashUploadTo:
    def __call__(self, instance, filename):
        file_extension = os.path.splitext(filename)[1]
        folder = ""
        if hasattr(instance, 'image'):
            folder = "image"
            file_field = instance.image
        elif hasattr(instance, 'video'):
            folder = "video"
            file_field = instance.video
        else:
            raise ValidationError("Unsupported file type.")
        hash_value = self.get_file_hash(file_field,)
        return f'{instance._meta.app_label}/album/{instance.album.id}/{folder}/{hash_value}{file_extension}'
    
    def get_file_hash(self, file,):
        """
        计算文件的哈希值
        """
        hash_sha256 = hashlib.sha256()
        hash_sha256.update(str(datetime.now()).encode("utf-8"))
        for chunk in file.chunks():
            hash_sha256.update(chunk)
        return hash_sha256.hexdigest()


class Picture(models.Model):
    name = models.CharField(max_length=100, verbose_name='图片名称')
    image = models.ImageField(upload_to=HashUploadTo(), verbose_name='图片')
    description = models.TextField(blank=True, null=True, verbose_name='Description')
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='pictures', verbose_name='相册')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='上传于')
    picture_type = models.CharField(choices=[("user_upload", "用户上传"), ("default_cover", "默认相册封面")], default="user_upload", max_length=50)
    tag = models.ManyToManyField('Tag', blank=True, verbose_name='标签', related_name="pictures")

    def __str__(self):
        return self.name
    
    # def save(self, *args, **kwargs):
    #     if self.image:
    #         self.name = HashUploadTo().get_file_hash(self.image,)
    #     super().save(*args, **kwargs)

    def delete(self, using = None, keep_parents = False):
        if self.image:
            if self.picture_type == "default_cover":
                return
            image_path = self.image.path
            if os.path.isfile(image_path) and self.picture_type != "default_cover":
                os.remove(image_path)
        return super().delete(using, keep_parents)

    class Meta:
        verbose_name = '图片'

class Tag(models.Model):
    name = models.CharField(max_length=100, verbose_name='标签名称', unique=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = '标签'
        verbose_name_plural = '标签'

class Video(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='videos', verbose_name='相册')
    name = models.CharField(max_length=100, verbose_name='视频名称', blank=True, null=True)
    video = models.FileField(upload_to=HashUploadTo(), verbose_name='视频')
    upload_at = models.DateTimeField(auto_now_add=True, verbose_name='上传于')
    description = models.TextField(blank=True, null=True, verbose_name='描述')
    tag = models.ManyToManyField('Tag', blank=True, verbose_name='标签', related_name="videos")

    def __str__(self):
        return self.name if self.name else os.path.basename(self.video.name)

