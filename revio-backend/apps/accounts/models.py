from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    # Premium
    is_premium = models.BooleanField(default=False)

    # Uploads
    daily_uploads_used = models.IntegerField(default=0)
    last_upload_date = models.DateField(null=True, blank=True)

    # Photos
    daily_photos_used = models.IntegerField(default=0)
    last_photo_date = models.DateField(null=True, blank=True)

    # Prof IA
    daily_ai_questions_used = models.IntegerField(default=0)
    last_ai_question_date = models.DateField(null=True, blank=True)

    # Streak
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    # XP + Niveau
    xp = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
    
    # Photos

    def can_upload_photo(self):
        today = timezone.now().date()
        if self.last_photo_date != today:
            self.daily_photos_used = 0
            self.last_photo_date = today
            self.save()
        if not self.is_premium:
            return self.daily_photos_used < 1  # 1 photo/jour gratuit
        return True  # illimité en premium

    def increment_photo_upload(self):
        today = timezone.now().date()
        if self.last_photo_date != today:
            self.daily_photos_used = 0
            self.last_photo_date = today
        self.daily_photos_used += 1
        self.save()

    # --- Uploads ---
    def can_upload(self):
        today = timezone.now().date()
        if self.last_upload_date != today:
            self.daily_uploads_used = 0
            self.last_upload_date = today
            self.save()
        if self.is_premium:
            return True
        return self.daily_uploads_used < 2

    # --- Prof IA ---
    def can_ask_professor(self):
        today = timezone.now().date()
        if self.last_ai_question_date != today:
            self.daily_ai_questions_used = 0
            self.last_ai_question_date = today
            self.save()
        if self.is_premium:
            return True
        return self.daily_ai_questions_used < 7

    def increment_ai_questions(self):
        today = timezone.now().date()
        if self.last_ai_question_date != today:
            self.daily_ai_questions_used = 0
            self.last_ai_question_date = today
        self.daily_ai_questions_used += 1
        self.save()

    # --- Streak ---
    def update_streak(self):
        today = timezone.now().date()
        if self.last_activity_date == today:
            return  # déjà mis à jour aujourd'hui
        yesterday = today - timezone.timedelta(days=1)
        if self.last_activity_date == yesterday:
            self.current_streak += 1
        else:
            self.current_streak = 1  # streak cassé
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        self.last_activity_date = today
        self.save()

    # --- XP ---
    def add_xp(self, amount):
        self.xp += amount
        self.save()

    @property
    def level(self):
        if self.xp < 100:
            return {'number': 1, 'name': 'Débutant', 'next': 100}
        elif self.xp < 300:
            return {'number': 2, 'name': 'Réviseur', 'next': 300}
        elif self.xp < 600:
            return {'number': 3, 'name': 'Expert', 'next': 600}
        else:
            return {'number': 4, 'name': 'Master', 'next': None}
    
    @property
    def ai_questions_remaining(self):
        if self.is_premium:
            return -1
        return max(0, 7 - self.daily_ai_questions_used)
    
class Notification(models.Model):
    TYPE_CHOICES = [
        ('flashcards_due',   '🃏 Flashcards à revoir'),
        ('streak_danger',    '🔥 Streak en danger'),
        ('streak_broken',    '💔 Streak cassé'),
        ('level_up',         '⭐ Niveau supérieur'),
        ('exam_unlocked',    '🏆 Examen débloqué'),
        ('welcome',          '👋 Bienvenue'),
        ('premium_active',   '✨ Premium activé'),
        ('weak_points',      '🎯 Points faibles détectés'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.title}"