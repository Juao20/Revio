from rest_framework import serializers
from .models import Flashcard, Quiz, QuizAnswer, StudySession, RevisionPlan, StudyActivity
from django.utils import timezone

class FlashcardSerializer(serializers.ModelSerializer):
    is_due = serializers.SerializerMethodField()

    class Meta:
        model = Flashcard
        fields = [
            'id', 'question', 'answer', 'difficulty',
            'next_review_date', 'ease_factor', 'interval',
            'review_count', 'is_due'
        ]

    def get_is_due(self, obj):
        return obj.next_review_date <= timezone.now().date()


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'question', 'options', 'correct_answer', 'explanation', 'topic']


class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ['id', 'quiz', 'selected_answer', 'is_correct', 'answered_at']
        read_only_fields = ['id', 'answered_at']


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = ['id', 'course', 'score', 'total_questions', 'duration', 'created_at']
        read_only_fields = ['id', 'created_at']


class RevisionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevisionPlan
        fields = ['id', 'course', 'exam_date', 'plan', 'created_at']
        read_only_fields = ['id', 'created_at']


class StudyActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyActivity
        fields = ['date', 'sessions_count', 'xp_earned']