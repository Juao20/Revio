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
MAX_PHOTOS_PER_COURSE_PREMIUM = 3

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
        upload_type = request.data.get('upload_type', 'text')

        # Vérification limite photo
        if upload_type == 'image':
            if not user.can_upload_photo():
                return Response(
                    {'error': 'Limite atteinte. En gratuit tu as 1 photo/jour. Passe en Premium !'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            # Vérification limite upload classique
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

        # Extraction PDF
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

        # Extraction image
        elif upload_type == 'image' and file and not content:
            if file.content_type not in ALLOWED_IMAGE_TYPES:
                return Response(
                    {'error': 'Format non supporté. Utilise JPG, PNG ou WEBP.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if file.size > 10 * 1024 * 1024:
                return Response(
                    {'error': 'Image trop lourde. Maximum 10MB.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                image_data = file.read()
                content = extract_text_from_image(image_data, file.content_type)
                if not content.strip():
                    return Response(
                        {'error': 'Impossible d\'extraire le texte. Vérifie la qualité de la photo.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.increment_photo_upload()
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

        # Mettre à jour le compteur uploads (pas pour les photos, déjà géré)
        if upload_type != 'image':
            today = timezone.now().date()
            if user.last_upload_date != today:
                user.daily_uploads_used = 0
                user.last_upload_date = today
            user.daily_uploads_used += 1
            user.save()

        return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)


class CourseAddPhotoView(APIView):
    """Ajouter des photos supplémentaires à un cours existant — Premium uniquement"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = request.user

        if not user.is_premium:
            return Response(
                {'error': 'L\'ajout de photos à un cours existant est une fonctionnalité Premium.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            course = Course.objects.get(pk=pk, user=user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        # Compter les photos déjà ajoutées à ce cours
        photos_count = course.photos_count
        if photos_count >= MAX_PHOTOS_PER_COURSE_PREMIUM:
            return Response(
                {'error': f'Maximum {MAX_PHOTOS_PER_COURSE_PREMIUM} photos par cours en Premium.'},
                status=status.HTTP_403_FORBIDDEN
            )

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Aucune image fournie.'}, status=status.HTTP_400_BAD_REQUEST)

        if file.content_type not in ALLOWED_IMAGE_TYPES:
            return Response(
                {'error': 'Format non supporté. Utilise JPG, PNG ou WEBP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if file.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'Image trop lourde. Maximum 10MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            image_data = file.read()
            extracted_text = extract_text_from_image(image_data, file.content_type)
            if not extracted_text.strip():
                return Response(
                    {'error': 'Impossible d\'extraire le texte. Vérifie la qualité de la photo.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ajouter le texte extrait au cours existant
            course.content += f'\n\n--- Page {photos_count + 2} ---\n\n{extracted_text}'
            course.photos_count += 1
            course.save()

            return Response({
                'message': f'Photo {photos_count + 1}/{MAX_PHOTOS_PER_COURSE_PREMIUM} ajoutée avec succès.',
                'photos_count': course.photos_count,
                'photos_remaining': MAX_PHOTOS_PER_COURSE_PREMIUM - course.photos_count,
            })
        except Exception as e:
            return Response(
                {'error': f'Erreur analyse image : {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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