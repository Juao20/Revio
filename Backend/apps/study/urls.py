from django.urls import path
from .views import (
    GenerateStudyContentView,
    FlashcardListView,
    QuizListView,
    StudySessionView,
    AskProfessorView,
    RevisionPlanView,
)

urlpatterns = [
    path('<int:course_id>/generate/', GenerateStudyContentView.as_view(), name='generate-content'),
    path('<int:course_id>/flashcards/', FlashcardListView.as_view(), name='flashcard-list'),
    path('<int:course_id>/quiz/', QuizListView.as_view(), name='quiz-list'),
    path('<int:course_id>/professor/', AskProfessorView.as_view(), name='ask-professor'),
    path('<int:course_id>/revision-plan/', RevisionPlanView.as_view(), name='revision-plan'),
    path('sessions/', StudySessionView.as_view(), name='study-sessions'),
]
