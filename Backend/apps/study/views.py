from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.courses.models import Course
from .models import Flashcard, Quiz, StudySession, RevisionPlan
from .serializers import (
    FlashcardSerializer, QuizSerializer,
    StudySessionSerializer, RevisionPlanSerializer
)
from .ai_service import generate_study_content, ask_professor, generate_revision_plan


class GenerateStudyContentView(APIView):
    """Génère flashcards + quiz + résumé via IA pour un cours"""
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if not course.content:
            return Response({'error': 'Ce cours n\'a pas de contenu'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            data = generate_study_content(course.content, request.user.is_premium)
        except Exception as e:
            return Response({'error': f'Erreur IA : {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Supprimer les anciennes flashcards et quiz du cours
        course.flashcards.all().delete()
        course.quizzes.all().delete()

        # Sauvegarder les flashcards
        flashcards = []
        for fc in data.get('flashcards', []):
            flashcard = Flashcard.objects.create(
                course=course,
                question=fc['question'],
                answer=fc['answer'],
                difficulty=fc.get('difficulty', 'medium')
            )
            flashcards.append(flashcard)

        # Sauvegarder les quiz
        quizzes = []
        for q in data.get('quiz', []):
            quiz = Quiz.objects.create(
                course=course,
                question=q['question'],
                options=q['options'],
                correct_answer=q['correct_answer'],
                explanation=q.get('explanation', '')
            )
            quizzes.append(quiz)

        return Response({
            'flashcards': FlashcardSerializer(flashcards, many=True).data,
            'quizzes': QuizSerializer(quizzes, many=True).data,
            'summary': data.get('summary', []),
            'key_concepts': data.get('key_concepts', []),
        }, status=status.HTTP_201_CREATED)


class FlashcardListView(APIView):
    """Récupère les flashcards d'un cours"""
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        flashcards = course.flashcards.all()
        return Response(FlashcardSerializer(flashcards, many=True).data)


class QuizListView(APIView):
    """Récupère les quiz d'un cours"""
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        quizzes = course.quizzes.all()
        return Response(QuizSerializer(quizzes, many=True).data)


class StudySessionView(APIView):
    """Enregistre une session de quiz"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StudySessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """Historique des sessions (Premium)"""
        if not request.user.is_premium:
            return Response(
                {'error': 'Fonctionnalité Premium'},
                status=status.HTTP_403_FORBIDDEN
            )
        sessions = StudySession.objects.filter(user=request.user).order_by('-created_at')
        return Response(StudySessionSerializer(sessions, many=True).data)


class AskProfessorView(APIView):
    """Le prof IA — Premium uniquement"""
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        if not request.user.is_premium:
            return Response(
                {'error': 'Le Prof IA est une fonctionnalité Premium'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        question = request.data.get('question', '').strip()
        if not question:
            return Response({'error': 'Question manquante'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            answer = ask_professor(course.content, question)
        except Exception as e:
            return Response({'error': f'Erreur IA : {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'answer': answer})


class RevisionPlanView(APIView):
    """Génère un plan de révision personnalisé"""
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        exam_date = request.data.get('exam_date')
        if not exam_date:
            return Response({'error': 'Date d\'examen manquante'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan_data = generate_revision_plan(course.content, exam_date, course.title)
        except Exception as e:
            return Response({'error': f'Erreur IA : {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        plan = RevisionPlan.objects.create(
            course=course,
            exam_date=exam_date,
            plan=plan_data
        )

        return Response(RevisionPlanSerializer(plan).data, status=status.HTTP_201_CREATED)

    def get(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        plan = RevisionPlan.objects.filter(course=course).last()
        if not plan:
            return Response({'error': 'Aucun plan trouvé'}, status=status.HTTP_404_NOT_FOUND)

        return Response(RevisionPlanSerializer(plan).data)