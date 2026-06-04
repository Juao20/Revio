from django.db import models
from django.utils import timezone
from django.utils.timezone import now as timezone_now
import datetime
from apps.courses.models import Course
from django.conf import settings

class Flashcard(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Facile'),
        ('medium', 'Moyen'),
        ('hard', 'Difficile'),
    ]
    topic = models.CharField(max_length=100, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='flashcards')
    question = models.TextField()
    answer = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')

    # Révision espacée
    next_review_date = models.DateField(default=datetime.date.today)
    ease_factor = models.FloatField(default=2.5)
    interval = models.IntegerField(default=1)  # en jours
    review_count = models.IntegerField(default=0)

    def __str__(self):
        return f"Flashcard — {self.course.title}"

    def update_review(self, quality):
        """
        Algorithme SM-2 (Anki)
        quality: 0 (raté) à 5 (parfait)
        """
        if quality < 3:
            self.interval = 1
            self.review_count = 0
        else:
            if self.review_count == 0:
                self.interval = 1
            elif self.review_count == 1:
                self.interval = 6
            else:
                self.interval = round(self.interval * self.ease_factor)
            self.ease_factor = max(
                1.3,
                self.ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
            )
            self.review_count += 1

        self.next_review_date = timezone.now().date() + timezone.timedelta(days=self.interval)
        self.save()


class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    question = models.TextField()
    options = models.JSONField()
    correct_answer = models.CharField(max_length=255)
    explanation = models.TextField(blank=True)
    topic = models.CharField(max_length=100, blank=True)  # thème pour détection faiblesses

    def __str__(self):
        return f"Quiz — {self.course.title}"


class QuizAnswer(models.Model):
    """Stocke chaque réponse pour détecter les points faibles"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_answers')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='answers')
    selected_answer = models.CharField(max_length=255)
    is_correct = models.BooleanField()
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} — {self.quiz.question[:30]}"


class StudySession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    duration = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session — {self.user.username} — {self.course.title}"


class RevisionPlan(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='revision_plans')
    exam_date = models.DateField()
    plan = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Plan — {self.course.title}"


class StudyActivity(models.Model):
    """Pour la heatmap de révision"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    date = models.DateField()
    sessions_count = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)

    class Meta:
        unique_together = ['user', 'date']

    def __str__(self):
        return f"Activity — {self.user.username} — {self.date}"
    
class ExamSession(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Facile'),
        ('medium', 'Moyen'),
        ('hard', 'Difficile'),
        ('final', 'Examen Final'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exam_sessions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exam_sessions')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    duration_seconds = models.IntegerField(default=0)  # temps alloué
    time_used_seconds = models.IntegerField(default=0)  # temps réellement utilisé
    answers = models.JSONField(default=list)  # toutes les réponses
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Exam — {self.user.username} — {self.course.title} — {self.difficulty}"

    class Meta:
        ordering = ['-created_at']