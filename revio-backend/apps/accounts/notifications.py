from django.utils import timezone

def create_notification(user, notif_type, title, message):
    """Crée une notification pour un utilisateur"""
    from apps.accounts.models import Notification

    # Éviter les doublons sur la même journée pour certains types
    today = timezone.now().date()
    daily_types = ['flashcards_due', 'streak_danger']

    if notif_type in daily_types:
        already_exists = Notification.objects.filter(
            user=user,
            type=notif_type,
            created_at__date=today
        ).exists()
        if already_exists:
            return None

    return Notification.objects.create(
        user=user,
        type=notif_type,
        title=title,
        message=message,
    )


def notify_welcome(user):
    create_notification(
        user,
        'welcome',
        'Bienvenue sur StudyBuddy ! 👋',
        'Commence par uploader ton premier cours pour générer tes flashcards et quiz.'
    )


def notify_flashcards_due(user, count):
    create_notification(
        user,
        'flashcards_due',
        f'{count} flashcard(s) à revoir aujourd\'hui 🃏',
        f'Tu as {count} flashcard(s) à revoir aujourd\'hui. Ne casse pas ta série !'
    )


def notify_streak_danger(user):
    create_notification(
        user,
        'streak_danger',
        'Ton streak est en danger ! 🔥',
        f'Tu as un streak de {user.current_streak} jours. Révise aujourd\'hui pour ne pas le perdre !'
    )


def notify_streak_broken(user):
    create_notification(
        user,
        'streak_broken',
        'Ton streak a été cassé 💔',
        'Pas de panique ! Recommence aujourd\'hui et construis une nouvelle série.'
    )


def notify_level_up(user, new_level):
    create_notification(
        user,
        'level_up',
        f'Niveau {new_level["number"]} atteint ! ⭐',
        f'Félicitations ! Tu es maintenant {new_level["name"]}. Continue comme ça !'
    )


def notify_exam_unlocked(user, course_title):
    create_notification(
        user,
        'exam_unlocked',
        'Examen Final débloqué ! 🏆',
        f'Tu as atteint 75% de maîtrise sur "{course_title}". L\'examen final est maintenant disponible !'
    )


def notify_premium_active(user):
    create_notification(
        user,
        'premium_active',
        'Premium activé ! ✨',
        'Toutes les fonctionnalités Premium sont maintenant disponibles. Bonne révision !'
    )


def notify_weak_points(user, course_title, weak_topics):
    topics_str = ', '.join([t['topic'] for t in weak_topics[:3]])
    create_notification(
        user,
        'weak_points',
        f'Points faibles détectés 🎯',
        f'Sur "{course_title}", tu as des difficultés sur : {topics_str}. Travaille ces points !'
    )