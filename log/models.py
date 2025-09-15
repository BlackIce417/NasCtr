from django.db import models

# Create your models here.


from django.db import models
from django.contrib.auth.models import User

class SystemLog(models.Model):
    LEVEL_CHOICES = [
        ("INFO", "INFO"),
        ("WARNING", "WARNING"),
        ("ERROR", "ERROR"),
    ]
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.level}] {self.message[:30]}"

