from django.db import models
from django.conf import settings

class Course(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    title = models.CharField(max_length=255)
    content = models.TextField()
    file = models.FileField(upload_to='courses/', null=True, blank=True)

    # Résumé et concepts
    summary = models.JSONField(null=True, blank=True)
    key_concepts = models.JSONField(null=True, blank=True)
    estimated_mastery_time = models.CharField(max_length=50, blank=True)

    # Stats IA
    concept_count = models.IntegerField(default=0)
    course_difficulty = models.CharField(max_length=10, blank=True)
    estimated_study_time_minutes = models.IntegerField(default=0)
    course_type = models.CharField(max_length=50, blank=True)

    # Photos
    photos_count = models.IntegerField(default=0)

    # Maîtrise
    mastery_score = models.FloatField(default=0.0)  # 0 à 100

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} — {self.user.username}"

    def update_mastery(self):
        """Calcule la maîtrise basée sur les sessions et flashcards"""
        from apps.study.models import StudySession, Flashcard
        from django.db.models import Avg

        sessions = StudySession.objects.filter(course=self)
        if not sessions.exists():
            return

        avg_score = sessions.aggregate(
            avg=Avg('score')
        )['avg'] or 0

        total_questions = sessions.aggregate(
            total=models.Sum('total_questions')
        )['total'] or 1

        total_score = sessions.aggregate(
            total=models.Sum('score')
        )['total'] or 0

        self.mastery_score = round((total_score / total_questions) * 100, 1)
        self.save()

    @property
    def mastery_label(self):
        if self.mastery_score < 50:
            return 'Faible'
        elif self.mastery_score < 70:
            return 'Moyen'
        elif self.mastery_score < 85:
            return 'Bon'
        elif self.mastery_score < 95:
            return 'Très bon'
        else:
            return 'Maîtrisé'

    @property
    def exam_unlocked(self):
        """L'examen final se débloque à 75% de maîtrise"""
        return self.mastery_score >= 75

    class Meta:
        ordering = ['-created_at']