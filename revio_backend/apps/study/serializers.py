from rest_framework import serializers
from .models import Flashcard, Quiz, QuizAnswer, StudySession, RevisionPlan, StudyActivity, ExamSession
from django.utils import timezone

class FlashcardSerializer(serializers.ModelSerializer):
    is_due = serializers.SerializerMethodField()

    class Meta:
        model = Flashcard
        fields = [
            'id', 'question', 'answer', 'difficulty', 'topic',
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

class ExamSessionSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = ExamSession
        fields = [
            'id', 'course', 'difficulty', 'score', 'total_questions',
            'duration_seconds', 'time_used_seconds', 'answers',
            'completed', 'created_at', 'percentage'
        ]
        read_only_fields = ['id', 'created_at']

    def get_percentage(self, obj):
        if obj.total_questions == 0:
            return 0
        return round((obj.score / obj.total_questions) * 100)