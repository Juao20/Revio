from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_email_notification(user, subject, html_content, text_content):
    """Envoie un email à l'utilisateur"""
    if not user.email:
        return

    try:
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False,
        )
    except Exception as e:
        logger.error(f"Erreur envoi email à {user.email}: {str(e)}")


def get_base_html(content: str, title: str) -> str:
    """Template HTML de base pour tous les emails"""
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:#1e1b4b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e1b4b;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:16px;padding:16px 24px;display:inline-block;">
                <span style="font-size:28px;">🎓</span>
                <span style="color:white;font-size:24px;font-weight:bold;margin-left:8px;vertical-align:middle;">Revio</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
              {content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">
                Tu reçois cet email car tu as un compte Revio.<br>
                © 2026 Revio. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def email_welcome(user):
    content = f"""
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Bienvenue sur Revio, {user.username} ! 👋</h1>
    <p style="color:rgba(165,180,252,1);font-size:16px;line-height:1.6;margin:0 0 24px;">
      Tu fais maintenant partie de la communauté Revio. Transforme tes cours en flashcards, quiz et plans de révision en quelques secondes grâce à l'IA.
    </p>

    <div style="background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:white;font-weight:600;margin:0 0 12px;">🚀 Pour commencer :</p>
      <ul style="color:rgba(165,180,252,1);margin:0;padding-left:20px;line-height:2;">
        <li>Upload ton premier cours (PDF, texte ou photo)</li>
        <li>Génère tes flashcards et quiz avec l'IA</li>
        <li>Révise avec le système de répétition espacée</li>
        <li>Pose tes questions au Prof IA</li>
      </ul>
    </div>

    <div style="text-align:center;">
      <a href="https://revio.app" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
        Commencer à réviser →
      </a>
    </div>
    """
    send_email_notification(
        user,
        subject="Bienvenue sur Revio ! 🎓",
        html_content=get_base_html(content, "Bienvenue sur Revio"),
        text_content=f"Bienvenue sur Revio {user.username} ! Commence par uploader ton premier cours sur https://revio.app"
    )


def email_streak_danger(user):
    content = f"""
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Ton streak est en danger ! 🔥</h1>
    <p style="color:rgba(165,180,252,1);font-size:16px;line-height:1.6;margin:0 0 24px;">
      Salut {user.username}, tu as un streak de <strong style="color:white;">{user.current_streak} jours</strong> et tu n'as pas encore révisé aujourd'hui.
    </p>

    <div style="background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.3);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="font-size:48px;margin:0 0 8px;">🔥</p>
      <p style="color:#fb923c;font-size:32px;font-weight:bold;margin:0;">{user.current_streak} jours</p>
      <p style="color:rgba(165,180,252,1);margin:8px 0 0;">de révision consécutifs</p>
    </div>

    <p style="color:rgba(165,180,252,1);font-size:15px;margin:0 0 24px;">
      Revise juste quelques flashcards aujourd'hui pour garder ta série !
    </p>

    <div style="text-align:center;">
      <a href="https://revio.app" style="background:linear-gradient(135deg,#ea580c,#dc2626);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
        Sauver mon streak maintenant 🔥
      </a>
    </div>
    """
    send_email_notification(
        user,
        subject=f"🔥 Ton streak de {user.current_streak} jours est en danger !",
        html_content=get_base_html(content, "Streak en danger"),
        text_content=f"Salut {user.username}, ton streak de {user.current_streak} jours est en danger ! Revise aujourd'hui sur https://revio.app"
    )


def email_streak_broken(user):
    content = f"""
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Ton streak a été cassé 💔</h1>
    <p style="color:rgba(165,180,252,1);font-size:16px;line-height:1.6;margin:0 0 24px;">
      Pas de panique {user.username} ! Ça arrive à tout le monde. L'important c'est de reprendre dès aujourd'hui.
    </p>

    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="font-size:48px;margin:0 0 8px;">💔</p>
      <p style="color:rgba(165,180,252,1);margin:0;">Ton meilleur streak : <strong style="color:white;">{user.longest_streak} jours</strong></p>
    </div>

    <p style="color:rgba(165,180,252,1);font-size:15px;margin:0 0 24px;">
      Revise aujourd'hui et commence une nouvelle série. Tu peux battre ton record !
    </p>

    <div style="text-align:center;">
      <a href="https://revio.app" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
        Reprendre maintenant →
      </a>
    </div>
    """
    send_email_notification(
        user,
        subject="💔 Ton streak a été cassé — Reprends dès aujourd'hui !",
        html_content=get_base_html(content, "Streak cassé"),
        text_content=f"Salut {user.username}, ton streak a été cassé. Reprends dès aujourd'hui sur https://revio.app !"
    )


def email_level_up(user, new_level):
    content = f"""
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Nouveau niveau atteint ! ⭐</h1>
    <p style="color:rgba(165,180,252,1);font-size:16px;line-height:1.6;margin:0 0 24px;">
      Félicitations {user.username} ! Tu as atteint un nouveau niveau grâce à ta régularité.
    </p>

    <div style="background:linear-gradient(135deg,rgba(124,58,237,0.3),rgba(79,70,229,0.3));border:1px solid rgba(124,58,237,0.4);border-radius:12px;padding:32px;margin-bottom:24px;text-align:center;">
      <p style="font-size:48px;margin:0 0 8px;">⭐</p>
      <p style="color:rgba(165,180,252,1);font-size:14px;margin:0 0 4px;">NIVEAU {new_level['number']}</p>
      <p style="color:white;font-size:32px;font-weight:bold;margin:0;">{new_level['name']}</p>
      <p style="color:rgba(165,180,252,1);margin:8px 0 0;">{user.xp} XP total</p>
    </div>

    <div style="text-align:center;">
      <a href="https://revio.app" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
        Voir ma progression →
      </a>
    </div>
    """
    send_email_notification(
        user,
        subject=f"⭐ Tu es maintenant {new_level['name']} sur Revio !",
        html_content=get_base_html(content, "Niveau supérieur"),
        text_content=f"Félicitations {user.username} ! Tu es maintenant niveau {new_level['number']} — {new_level['name']} sur Revio !"
    )


def email_exam_unlocked(user, course_title):
    content = f"""
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Examen Final débloqué ! 🏆</h1>
    <p style="color:rgba(165,180,252,1);font-size:16px;line-height:1.6;margin:0 0 24px;">
      Bravo {user.username} ! Tu as atteint 75% de maîtrise sur ton cours. L'examen final est maintenant disponible.
    </p>

    <div style="background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#fbbf24;font-weight:600;margin:0 0 8px;">📚 Cours débloqué :</p>
      <p style="color:white;font-size:18px;font-weight:bold;margin:0;">{course_title}</p>
    </div>

    <p style="color:rgba(165,180,252,1);font-size:15px;margin:0 0 24px;">
      L'examen final reproduit les conditions réelles avec des questions fraîches générées par l'IA. Es-tu prêt ?
    </p>

    <div style="text-align:center;">
      <a href="https://revio.app" style="background:linear-gradient(135deg,#d97706,#b45309);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
        Passer l'examen final 🏆
      </a>
    </div>
    """
    send_email_notification(
        user,
        subject=f"🏆 Examen Final débloqué — {course_title}",
        html_content=get_base_html(content, "Examen débloqué"),
        text_content=f"Félicitations {user.username} ! L'examen final de '{course_title}' est débloqué sur https://revio.app"
    )


def email_premium_active(user):
    content = f"""
    <h1 style="color:white;font-size:24px;margin:0 0 16px;">Bienvenue dans Premium ! ✨</h1>
    <p style="color:rgba(165,180,252,1);font-size:16px;line-height:1.6;margin:0 0 24px;">
      Merci {user.username} ! Ton abonnement Premium est maintenant actif. Toutes les fonctionnalités sont débloquées.
    </p>

    <div style="background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#fbbf24;font-weight:600;margin:0 0 12px;">✨ Ce que tu as maintenant :</p>
      <ul style="color:rgba(165,180,252,1);margin:0;padding-left:20px;line-height:2.2;">
        <li>Uploads illimités</li>
        <li>Flashcards illimitées (3 photos par cours)</li>
        <li>Prof IA illimité</li>
        <li>Mode examen simulé</li>
        <li>Détection des points faibles</li>
        <li>Historique complet</li>
      </ul>
    </div>

    <div style="text-align:center;">
      <a href="https://revio.app" style="background:linear-gradient(135deg,#d97706,#b45309);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">
        Explorer Premium →
      </a>
    </div>
    """
    send_email_notification(
        user,
        subject="✨ Ton abonnement Revio Premium est actif !",
        html_content=get_base_html(content, "Premium activé"),
        text_content=f"Merci {user.username} ! Ton abonnement Premium Revio est maintenant actif. Profite de toutes les fonctionnalités sur https://revio.app"
    )