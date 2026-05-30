from django.db import models
from django.conf import settings

class Course(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    title = models.CharField(max_length=255)
    content = models.TextField()  # texte extrait du PDF ou copié-collé
    file = models.FileField(upload_to='courses/', null=True, blank=True)  # PDF optionnel
    summary = models.JSONField(null=True, blank=True)
    key_concepts = models.JSONField(null=True, blank=True)
    estimated_mastery_time = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} — {self.user.username}"

    class Meta:
        ordering = ['-created_at']