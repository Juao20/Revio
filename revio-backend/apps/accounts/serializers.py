from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, BugReport

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    level = serializers.SerializerMethodField()
    ai_questions_remaining = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email',
            'daily_uploads_used', 'daily_ai_questions_used',
            'daily_photos_used',
            'current_streak', 'longest_streak',
            'xp', 'level', 'ai_questions_remaining'
        ]

    def get_level(self, obj):
        return obj.level

    def get_ai_questions_remaining(self, obj):
        return -1  # illimité

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


class BugReportSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(write_only=True, required=False)
    
    class Meta:
        model = BugReport
        fields = ['id', 'title', 'description', 'severity', 'page', 'is_resolved', 'user_email', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_resolved']

    def create(self, validated_data):
        # Supprimer le champ user_email avant la création
        validated_data.pop('user_email', None)
        return super().create(validated_data)