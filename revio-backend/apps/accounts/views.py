from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
import json
import os
import requests
import secrets
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, BugReportSerializer
from .lemonsqueezy import create_checkout, MONTHLY_VARIANT_ID, YEARLY_VARIANT_ID
from .webhook import verify_webhook
from .models import Notification, BugReport
from .serializers import NotificationSerializer
from .notifications import notify_welcome

User = get_user_model()

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            # Notification de bienvenue
            notify_welcome(user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token manquant'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Appel de l'API Google pour vérifier l'ID Token
            google_response = requests.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token}",
                timeout=10
            )
            if google_response.status_code != 200:
                return Response({'error': 'Token Google invalide ou expiré'}, status=status.HTTP_400_BAD_REQUEST)
            
            user_info = google_response.json()
            
            # Validation optionnelle de l'audience
            client_id = os.getenv('GOOGLE_CLIENT_ID')
            if client_id and user_info.get('aud') != client_id:
                return Response({'error': 'Audience invalide'}, status=status.HTTP_400_BAD_REQUEST)
            
            email = user_info.get('email')
            if not email:
                return Response({'error': 'Email non fourni par Google'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Récupérer ou créer l'utilisateur
            user = User.objects.filter(email=email).first()
            if not user:
                # Créer un nom d'utilisateur unique
                username = email.split('@')[0]
                original_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}{counter}"
                    counter += 1
                
                # Créer l'utilisateur avec un mot de passe aléatoire
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=secrets.token_urlsafe(16)
                )
                # Notification de bienvenue
                notify_welcome(user)
            
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': f'Erreur de vérification: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user:
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data
                })
            return Response(
                {'error': 'Identifiants incorrects'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class CreateCheckoutView(APIView):
    """Crée un checkout LemonSqueezy"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan = request.data.get('plan')  # 'monthly' ou 'yearly'

        if plan == 'monthly':
            variant_id = MONTHLY_VARIANT_ID
        elif plan == 'yearly':
            variant_id = YEARLY_VARIANT_ID
        else:
            return Response(
                {'error': 'Plan invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            checkout_url = create_checkout(
                variant_id=variant_id,
                email=request.user.email,
                user_id=request.user.id,
                redirect_url=f'{FRONTEND_URL}/premium/success',
            )
            return Response({'checkout_url': checkout_url})
        except Exception as e:
            return Response(
                {'error': f'Erreur création checkout : {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class LemonSqueezyWebhookView(APIView):
    """Reçoit les webhooks LemonSqueezy"""
    permission_classes = [AllowAny]

    def post(self, request):
        signature = request.headers.get('X-Signature', '')
        payload = request.body

        if not verify_webhook(payload, signature):
            return HttpResponse(status=400)

        data = json.loads(payload)
        event = data.get('meta', {}).get('event_name', '')
        custom_data = data.get('meta', {}).get('custom_data', {})
        user_id = custom_data.get('user_id')

        if not user_id:
            return HttpResponse(status=200)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return HttpResponse(status=200)

        # Activer Premium
        if event in ['subscription_created', 'subscription_resumed', 'order_created']:
            user.is_premium = True
            user.save()

        # Désactiver Premium
        elif event in ['subscription_cancelled', 'subscription_expired', 'subscription_paused']:
            user.is_premium = False
            user.save()

        return HttpResponse(status=200)

class NotificationListView(APIView):
    """Liste des notifications"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)[:20]
        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({
            'notifications': NotificationSerializer(notifications, many=True).data,
            'unread_count': unread_count,
        })


class NotificationReadView(APIView):
    """Marquer une notification comme lue"""
    permission_classes = [IsAuthenticated]

    def post(self, request, notif_id):
        try:
            notif = Notification.objects.get(pk=notif_id, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({'success': True})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification introuvable'}, status=status.HTTP_404_NOT_FOUND)


class NotificationReadAllView(APIView):
    """Marquer toutes les notifications comme lues"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'success': True})

class BugReportListCreateView(APIView):
    """Créer et lister les rapports de bugs"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Liste les rapports de l'utilisateur"""
        bug_reports = BugReport.objects.filter(user=request.user)
        serializer = BugReportSerializer(bug_reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Créer un nouveau rapport de bug"""
        serializer = BugReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BugReportDetailView(APIView):
    """Détail d'un rapport de bug"""
    permission_classes = [IsAuthenticated]

    def get(self, request, bug_id):
        try:
            bug_report = BugReport.objects.get(pk=bug_id, user=request.user)
            serializer = BugReportSerializer(bug_report)
            return Response(serializer.data)
        except BugReport.DoesNotExist:
            return Response({'error': 'Rapport introuvable'}, status=status.HTTP_404_NOT_FOUND)