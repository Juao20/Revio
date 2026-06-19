from django.urls import path
from .views import (
    RegisterView, GoogleLoginView, LoginView, ProfileView,
    CreateCheckoutView, LemonSqueezyWebhookView,
    NotificationListView, NotificationReadView, NotificationReadAllView,
    BugReportListCreateView, BugReportDetailView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google/', GoogleLoginView.as_view(), name='google-login'),

    path('profile/', ProfileView.as_view(), name='profile'),
    path('checkout/', CreateCheckoutView.as_view(), name='checkout'),
    path('webhook/lemonsqueezy/', LemonSqueezyWebhookView.as_view(), name='webhook'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:notif_id>/read/', NotificationReadView.as_view(), name='notif-read'),
    path('notifications/read-all/', NotificationReadAllView.as_view(), name='notif-read-all'),
    path('bugs/', BugReportListCreateView.as_view(), name='bug-list-create'),
    path('bugs/<int:bug_id>/', BugReportDetailView.as_view(), name='bug-detail'),
]