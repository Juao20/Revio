from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Course
from .serializers import CourseSerializer, CourseUploadSerializer
from apps.study.ai_service import extract_text_from_image
import PyPDF2
import io

ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

class CourseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.filter(user=request.user)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


class CourseUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if not user.can_upload():
            return Response(
                {'error': 'Limite journalière atteinte (2 uploads/jour). Passe en Premium !'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CourseUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        content = serializer.validated_data.get('content', '')
        file = serializer.validated_data.get('file', None)
        upload_type = request.data.get('upload_type', 'text')  # text | pdf | image

        # Extraction selon le type
        if upload_type == 'pdf' and file and not content:
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
                content = ''
                for page in pdf_reader.pages:
                    content += page.extract_text() or ''
                if not content.strip():
                    return Response(
                        {'error': 'Impossible d\'extraire le texte de ce PDF.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                return Response(
                    {'error': f'Erreur lecture PDF : {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        elif upload_type == 'image' and file and not content:
            # Vérifier le type MIME
            file_content_type = file.content_type
            if file_content_type not in ALLOWED_IMAGE_TYPES:
                return Response(
                    {'error': 'Format non supporté. Utilise JPG, PNG ou WEBP.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifier la taille (max 10MB)
            if file.size > 10 * 1024 * 1024:
                return Response(
                    {'error': 'Image trop lourde. Maximum 10MB.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                image_data = file.read()
                content = extract_text_from_image(image_data, file_content_type)
                if not content.strip():
                    return Response(
                        {'error': 'Impossible d\'extraire le texte de cette image. Vérifie la qualité de la photo.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                return Response(
                    {'error': f'Erreur analyse image : {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Sauvegarder le cours
        course = Course.objects.create(
            user=user,
            title=serializer.validated_data['title'],
            content=content,
            file=file if upload_type == 'pdf' else None
        )

        # Mettre à jour le compteur
        today = timezone.now().date()
        if user.last_upload_date != today:
            user.daily_uploads_used = 0
            user.last_upload_date = today
        user.daily_uploads_used += 1
        user.save()

        return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)


class CourseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            course = Course.objects.get(pk=pk, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CourseSerializer(course).data)

    def delete(self, request, pk):
        try:
            course = Course.objects.get(pk=pk, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)
        course.delete()
        return Response({'message': 'Cours supprimé'}, status=status.HTTP_204_NO_CONTENT)