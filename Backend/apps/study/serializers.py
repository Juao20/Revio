from rest_framework import serializers
from .models import Flashcard, Quiz, StudySession, RevisionPlan

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = ['id', 'question', 'answer', 'difficulty']


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'question', 'options', 'correct_answer', 'explanation']


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