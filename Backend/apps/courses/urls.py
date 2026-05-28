from django.urls import path
from .views import CourseListView, CourseUploadView, CourseDetailView

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('upload/', CourseUploadView.as_view(), name='course-upload'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
]