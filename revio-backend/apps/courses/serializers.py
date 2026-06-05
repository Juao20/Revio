from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    mastery_label = serializers.ReadOnlyField()
    exam_unlocked = serializers.ReadOnlyField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'content', 'file',
            'summary', 'key_concepts', 'estimated_mastery_time',
            'concept_count', 'course_difficulty', 'estimated_study_time_minutes',
            'course_type', 'mastery_score', 'mastery_label', 'exam_unlocked',
            'photos_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CourseUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False)
    content = serializers.CharField(required=False)

    class Meta:
        model = Course
        fields = ['title', 'content', 'file']

    def validate(self, data):
        # Récupérer le upload_type depuis le contexte de la requête
        request = self.context.get('request')
        upload_type = request.data.get('upload_type', 'text') if request else 'text'

        if upload_type == 'text' and not data.get('content'):
            raise serializers.ValidationError("Le contenu est requis pour le mode texte.")

        if upload_type == 'pdf' and not data.get('file'):
            raise serializers.ValidationError("Un fichier PDF est requis pour le mode PDF.")

        # Pour le mode image les photos sont dans request.FILES directement
        # donc pas besoin de valider ici

        return data