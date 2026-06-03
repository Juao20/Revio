from django.urls import path
from .views import (
    GenerateStudyContentView,
    FlashcardListView,
    FlashcardReviewView,
    QuizListView,
    SubmitQuizAnswerView,
    WeakPointsView,
    StudySessionView,
    AskProfessorView,
    RevisionPlanView,
    HeatmapView,
    DueFlashcardsCountView,
    ExamStartView,
    ExamSubmitView,
    ExamHistoryView,
)

urlpatterns = [
    path('<int:course_id>/generate/', GenerateStudyContentView.as_view(), name='generate-content'),
    path('<int:course_id>/flashcards/', FlashcardListView.as_view(), name='flashcard-list'),
    path('<int:course_id>/flashcards/<int:flashcard_id>/review/', FlashcardReviewView.as_view(), name='flashcard-review'),
    path('<int:course_id>/quiz/', QuizListView.as_view(), name='quiz-list'),
    path('<int:course_id>/quiz/submit/', SubmitQuizAnswerView.as_view(), name='submit-answer'),
    path('<int:course_id>/weak-points/', WeakPointsView.as_view(), name='weak-points'),
    path('<int:course_id>/professor/', AskProfessorView.as_view(), name='ask-professor'),
    path('<int:course_id>/revision-plan/', RevisionPlanView.as_view(), name='revision-plan'),
    path('<int:course_id>/exam/start/', ExamStartView.as_view(), name='exam-start'),
    path('<int:course_id>/exam/<int:exam_id>/submit/', ExamSubmitView.as_view(), name='exam-submit'),
    path('<int:course_id>/exam/history/', ExamHistoryView.as_view(), name='exam-history'),
    path('sessions/', StudySessionView.as_view(), name='study-sessions'),
    path('heatmap/', HeatmapView.as_view(), name='heatmap'),
    path('due-flashcards/', DueFlashcardsCountView.as_view(), name='due-flashcards'),
]