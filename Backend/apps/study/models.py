from django.db import models
from apps.courses.models import Course
from django.conf import settings

class Flashcard(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Facile'),
        ('medium', 'Moyen'),
        ('hard', 'Difficile'),
    ]
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='flashcards')
    question = models.TextField()
    answer = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')

    def __str__(self):
        return f"Flashcard — {self.course.title}"


class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    question = models.TextField()
    options = models.JSONField()  # liste de 4 choix
    correct_answer = models.CharField(max_length=255)
    explanation = models.TextField(blank=True)

    def __str__(self):
        return f"Quiz — {self.course.title}"


class StudySession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    duration = models.IntegerField(default=0)  # en secondes
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session — {self.user.username} — {self.course.title}"


class RevisionPlan(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='revision_plans')
    exam_date = models.DateField()
    plan = models.JSONField()  # jours et tâches
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Plan — {self.course.title}"