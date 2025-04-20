import os
import subprocess
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Video
from django.conf import settings

@receiver(post_save, sender=Video)
def convert_video_format(sender, instance, created, **kwargs):
    if created and instance.video:
        input_path = instance.video.path
        input_dir = os.path.dirname(input_path)
        file_base, _ = os.path.splitext(input_path)
        temp_output_path = file_base + "_converted.mp4"

        # ffmpeg 转码命令
        command = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            temp_output_path
        ]

        try:
            subprocess.run(command, check=True)

            # 删除原文件，替换成转码后的视频
            os.remove(input_path)
            os.rename(temp_output_path, input_path)

            # 注意：路径不变，所以不用更新字段
        except subprocess.CalledProcessError as e:
            print("转码失败：", e)