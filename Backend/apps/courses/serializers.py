from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'content', 'file', 'created_at']
        read_only_fields = ['id', 'created_at']


class CourseUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False)
    content = serializers.CharField(required=False)

    class Meta:
        model = Course
        fields = ['title', 'content', 'file']

    def validate(self, data):
        if not data.get('content') and not data.get('file'):
            raise serializers.ValidationError("Tu dois fournir un fichier PDF ou du texte.")
        return data