from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Avg, Count, Q
from apps.courses.models import Course
from .models import Flashcard, Quiz, QuizAnswer, StudySession, RevisionPlan, StudyActivity, ExamSession
from .serializers import (
    FlashcardSerializer, QuizSerializer, QuizAnswerSerializer,
    StudySessionSerializer, RevisionPlanSerializer, StudyActivitySerializer,
    ExamSessionSerializer
)
from apps.accounts.notifications import (
    notify_flashcards_due,
    notify_level_up,
    notify_exam_unlocked,
    notify_weak_points,
)
import random
from .ai_service import generate_study_content, ask_professor, generate_revision_plan, generate_exam_questions


def record_activity(user, xp=0):
    """Met à jour streak, XP, heatmap et notifications"""
    old_level = user.level['number']
    user.update_streak()
    if xp > 0:
        user.add_xp(xp)
        # Vérifier level up
        new_level = user.level
        if new_level['number'] > old_level:
            notify_level_up(user, new_level)

    today = timezone.now().date()
    activity, _ = StudyActivity.objects.get_or_create(user=user, date=today)
    activity.sessions_count += 1
    activity.xp_earned += xp
    activity.save()


class GenerateStudyContentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if not course.content:
            return Response({'error': 'Ce cours n\'a pas de contenu'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            data = generate_study_content(course.content)
        except Exception as e:
            return Response({'error': f'Erreur IA : {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Supprimer ancien contenu
        course.flashcards.all().delete()
        course.quizzes.all().delete()

        # Sauvegarder flashcards
        flashcards = []
        for fc in data.get('flashcards', []):
            flashcard = Flashcard.objects.create(
                course=course,
                question=fc['question'],
                answer=fc['answer'],
                difficulty=fc.get('difficulty', 'medium')
            )
            flashcards.append(flashcard)

        # Sauvegarder quiz avec topic
        quizzes = []
        for q in data.get('quiz', []):
            quiz = Quiz.objects.create(
                course=course,
                question=q['question'],
                options=q['options'],
                correct_answer=q['correct_answer'],
                explanation=q.get('explanation', ''),
                topic=q.get('topic', '')
            )
            quizzes.append(quiz)

        # Dans GenerateStudyContentView.post(), après avoir sauvegardé flashcards et quizzes :
        concepts_data = data.get('concepts_data', {})
        course.summary = data.get('summary', [])
        course.key_concepts = data.get('key_concepts', [])
        course.estimated_mastery_time = data.get('estimated_mastery_time', '')
        course.concept_count = concepts_data.get('concept_count', 0)
        course.course_difficulty = concepts_data.get('difficulty', '')
        course.estimated_study_time_minutes = concepts_data.get('estimated_study_time_minutes', 0)
        course.course_type = concepts_data.get('course_type', '')
        course.save()

        # XP pour génération
        record_activity(request.user, xp=5)

        return Response({
            'flashcards': FlashcardSerializer(flashcards, many=True).data,
            'quizzes': QuizSerializer(quizzes, many=True).data,
            'summary': data.get('summary', []),
            'key_concepts': data.get('key_concepts', []),
            'estimated_mastery_time': course.estimated_mastery_time,
        }, status=status.HTTP_201_CREATED)


class FlashcardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        # Filtre cartes à revoir aujourd'hui si ?due=true
        due_only = request.query_params.get('due', 'false') == 'true'
        flashcards = course.flashcards.all()
        if due_only:
            flashcards = flashcards.filter(next_review_date__lte=timezone.now().date())

        return Response(FlashcardSerializer(flashcards, many=True).data)


class FlashcardReviewView(APIView):
    """Met à jour une flashcard après révision (algorithme SM-2)"""
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, flashcard_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
            flashcard = Flashcard.objects.get(pk=flashcard_id, course=course)
        except (Course.DoesNotExist, Flashcard.DoesNotExist):
            return Response({'error': 'Introuvable'}, status=status.HTTP_404_NOT_FOUND)

        quality = request.data.get('quality', 0)  # 0-5
        if not isinstance(quality, int) or isinstance(quality, bool) or quality < 0 or quality > 5:
            return Response({'error': 'Quality doit être entre 0 et 5'}, status=status.HTTP_400_BAD_REQUEST)

        flashcard.update_review(quality)

        # XP selon qualité
        xp = 10 if quality >= 4 else 5 if quality >= 3 else 0
        record_activity(request.user, xp=xp)

        return Response(FlashcardSerializer(flashcard).data)


class QuizListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        quizzes = course.quizzes.all()
        return Response(QuizSerializer(quizzes, many=True).data)


class SubmitQuizAnswerView(APIView):
    """Soumet une réponse et détecte les points faibles"""
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        quiz_id = request.data.get('quiz_id')
        selected_answer = request.data.get('selected_answer')

        try:
            course = Course.objects.get(pk=course_id, user=request.user)
            quiz = Quiz.objects.get(pk=quiz_id, course=course)
        except (Course.DoesNotExist, Quiz.DoesNotExist):
            return Response({'error': 'Introuvable'}, status=status.HTTP_404_NOT_FOUND)

        is_correct = selected_answer == quiz.correct_answer

        # Sauvegarder la réponse
        QuizAnswer.objects.create(
            user=request.user,
            quiz=quiz,
            selected_answer=selected_answer,
            is_correct=is_correct
        )

        # XP si correct
        if is_correct:
            record_activity(request.user, xp=10)

        return Response({
            'is_correct': is_correct,
            'correct_answer': quiz.correct_answer,
            'explanation': quiz.explanation,
        })


class WeakPointsView(APIView):
    """Détecte les points faibles par topic"""
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        # Calculer le score par topic
        answers = QuizAnswer.objects.filter(
            user=request.user,
            quiz__course=course
        ).values('quiz__topic').annotate(
            total=Count('id'),
            correct=Count('id', filter=Q(is_correct=True))
        )

        weak_points = []
        strong_points = []

        for item in answers:
            topic = item['quiz__topic'] or 'Général'
            if item['total'] == 0:
                continue
            score = round((item['correct'] / item['total']) * 100)
            data = {'topic': topic, 'score': score, 'total': item['total']}
            if score < 60:
                weak_points.append(data)
            else:
                strong_points.append(data)

        weak_points.sort(key=lambda x: x['score'])
        strong_points.sort(key=lambda x: x['score'], reverse=True)

        if weak_points:
            notify_weak_points(request.user, course.title, weak_points)
        return Response({
            'weak_points': weak_points,
            'strong_points': strong_points,
        })


class StudySessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course')
        if not Course.objects.filter(pk=course_id, user=request.user).exists():
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudySessionSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save(user=request.user)

            # XP selon score
            pct = (session.score / session.total_questions * 100) if session.total_questions > 0 else 0
            xp = 50 if pct >= 80 else 30 if pct >= 50 else 10
            record_activity(request.user, xp=xp)

            return Response({
                **serializer.data,
                'xp_earned': xp,
                'new_streak': request.user.current_streak,
                'new_xp': request.user.xp,
                'level': request.user.level,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        sessions = StudySession.objects.filter(user=request.user).order_by('-created_at')
        return Response(StudySessionSerializer(sessions, many=True).data)


class AskProfessorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        question = request.data.get('question', '').strip()
        history = request.data.get('history', [])  # historique conversation

        if not question:
            return Response({'error': 'Question manquante'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            answer = ask_professor(course.content, question, history)
            request.user.increment_ai_questions()
        except Exception as e:
            return Response({'error': f'Erreur IA : {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'answer': answer,
            'questions_remaining': -1
        })

class RevisionPlanView(APIView):
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

        record_activity(request.user, xp=30)

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


class HeatmapView(APIView):
    """Heatmap de révision sur 365 jours"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        activities = StudyActivity.objects.filter(
            user=request.user
        ).order_by('date')
        return Response(StudyActivitySerializer(activities, many=True).data)


class DueFlashcardsCountView(APIView):
    """Nombre de flashcards à revoir aujourd'hui (pour le dashboard)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        count = Flashcard.objects.filter(
            course__user=request.user,
            next_review_date__lte=today
        ).count()
        return Response({'due_count': count})

EXAM_CONFIG = {
    'easy':   {'minutes': 10},
    'medium': {'minutes': 20},
    'hard':   {'minutes': 30},
    'final':  {'minutes': 60},
}

class ExamStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id, user=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Cours introuvable'}, status=status.HTTP_404_NOT_FOUND)

        difficulty = request.data.get('difficulty', 'medium')
        if difficulty not in EXAM_CONFIG:
            return Response({'error': 'Difficulté invalide'}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier que l'examen final est débloqué
        if difficulty == 'final' and not course.exam_unlocked:
            return Response({
                'error': f'L\'examen final se débloque à 75% de maîtrise. Ta maîtrise actuelle : {course.mastery_score}%'
            }, status=status.HTTP_403_FORBIDDEN)

        if not course.content:
            return Response({'error': 'Ce cours n\'a pas de contenu'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Générer des questions FRAÎCHES via l'IA
            exam_data = generate_exam_questions(course.content, difficulty, course.title)
        except Exception as e:
            return Response({'error': f'Erreur IA : {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        questions = exam_data.get('questions', [])
        duration_minutes = exam_data.get('duration_minutes', EXAM_CONFIG[difficulty]['minutes'])

        # Créer la session d'examen
        exam = ExamSession.objects.create(
            user=request.user,
            course=course,
            difficulty=difficulty,
            total_questions=len(questions),
            duration_seconds=duration_minutes * 60,
        )

        return Response({
            'exam_id': exam.id,
            'difficulty': difficulty,
            'total_questions': len(questions),
            'duration_seconds': duration_minutes * 60,
            'questions': questions,
        }, status=status.HTTP_201_CREATED)


class ExamSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, exam_id):
        try:
            exam = ExamSession.objects.get(
                pk=exam_id,
                user=request.user,
                course__id=course_id
            )
        except ExamSession.DoesNotExist:
            return Response({'error': 'Examen introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if exam.completed:
            return Response({'error': 'Examen déjà soumis'}, status=status.HTTP_400_BAD_REQUEST)

        answers = request.data.get('answers', [])
        time_used = request.data.get('time_used_seconds', 0)

        score = 0
        detailed_answers = []

        for answer in answers:
            selected = answer.get('selected_answer', '')
            correct = answer.get('correct_answer', '')
            is_correct = selected == correct and selected != ''

            if is_correct:
                score += 1

            detailed_answers.append({
                'question': answer.get('question', ''),
                'selected_answer': selected,
                'correct_answer': correct,
                'explanation': answer.get('explanation', ''),
                'topic': answer.get('topic', ''),
                'difficulty': answer.get('difficulty', ''),
                'is_correct': is_correct,
            })

        # Mettre à jour l'examen
        exam.score = score
        exam.time_used_seconds = time_used
        exam.answers = detailed_answers
        exam.completed = True
        exam.save()

        # Sauvegarder comme session pour mettre à jour la maîtrise
        session = StudySession.objects.create(
            user=request.user,
            course=exam.course,
            score=score,
            total_questions=exam.total_questions,
            duration=time_used,
        )

        # Mettre à jour la maîtrise du cours
        exam.course.update_mastery()

        # Notifier si examen final débloqué
        if exam.course.exam_unlocked and exam.difficulty != 'final':
            notify_exam_unlocked(request.user, exam.course.title)

        # XP selon score
        percentage = round((score / exam.total_questions) * 100) if exam.total_questions > 0 else 0
        xp = 100 if percentage >= 80 else 60 if percentage >= 50 else 20
        record_activity(request.user, xp=xp)

        return Response({
            'exam_id': exam.id,
            'score': score,
            'total_questions': exam.total_questions,
            'percentage': percentage,
            'time_used_seconds': time_used,
            'duration_seconds': exam.duration_seconds,
            'xp_earned': xp,
            'new_mastery': exam.course.mastery_score,
            'exam_unlocked': exam.course.exam_unlocked,
            'detailed_answers': detailed_answers,
        })

class ExamHistoryView(APIView):
    """Historique des examens"""
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        exams = ExamSession.objects.filter(
            user=request.user,
            course__id=course_id,
            completed=True
        )
        return Response(ExamSessionSerializer(exams, many=True).data)