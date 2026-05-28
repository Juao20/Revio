from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_premium = models.BooleanField(default=False)
    daily_uploads_used = models.IntegerField(default=0)
    last_upload_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.email

    def can_upload(self):
        from django.utils import timezone
        today = timezone.now().date()
        if self.last_upload_date != today:
            self.daily_uploads_used = 0
            self.last_upload_date = today
            self.save()
        if self.is_premium:
            return True
        return self.daily_uploads_used < 2  # limite gratuit