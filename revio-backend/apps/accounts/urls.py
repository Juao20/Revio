from django.urls import path
from .views import RegisterView, LoginView, ProfileView, CreateCheckoutView, LemonSqueezyWebhookView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('checkout/', CreateCheckoutView.as_view(), name='checkout'),
    path('webhook/lemonsqueezy/', LemonSqueezyWebhookView.as_view(), name='webhook'),
]