from rest_framework import serializers
from django.contrib.auth import get_user_model

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
            'id', 'username', 'email', 'is_premium',
            'daily_uploads_used', 'daily_ai_questions_used',
            'daily_photos_used',
            'current_streak', 'longest_streak',
            'xp', 'level', 'ai_questions_remaining'
        ]

    def get_level(self, obj):
        return obj.level

    def get_ai_questions_remaining(self, obj):
        if obj.is_premium:
            return -1  # illimité
        used = obj.daily_ai_questions_used
        return max(0, 7 - used)