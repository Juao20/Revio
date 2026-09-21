# Revio 🎓

Revio est une plateforme de révision scolaire assistée par IA : importe un cours (texte, PDF ou photo), et Revio génère automatiquement un résumé, des flashcards, des quiz, un plan de révision espacée et un examen blanc — le tout gamifié (XP, niveaux, streaks) et **100% gratuit**.

## Fonctionnalités

- **Import de cours** — texte collé, PDF ou photo (extraction du texte par IA vision)
- **Analyse IA** — détection des concepts clés, résumé structuré, estimation du temps de maîtrise
- **Flashcards** avec révision espacée (algorithme SM-2)
- **Quiz interactifs** générés à partir du cours
- **Examens blancs** générés par IA, débloqués à partir de 75% de maîtrise
- **Prof IA** — chat pour poser des questions sur un cours, avec historique de conversation
- **Détection des points faibles** par thème, à partir des réponses aux quiz
- **Gamification** — XP, 4 niveaux (Débutant → Master), streaks quotidiens, heatmap d'activité
- **Authentification** — email/mot de passe ou connexion Google (OAuth)
- **Notifications** — cloche in-app + emails transactionnels (bienvenue, streak en danger/cassé, niveau supérieur, examen débloqué)
- **Signalement de bug** intégré à l'app

## Stack technique

**Backend** (`revio-backend/`)
- Django 6 + Django REST Framework
- SQLite en développement, PostgreSQL en production (`dj-database-url`)
- [Groq](https://groq.com) (LLaMA) pour l'analyse de cours, la génération de contenu et l'extraction de texte depuis les photos
- Cloudinary pour le stockage des fichiers PDF
- Déploiement : Render (`gunicorn` + `whitenoise`, voir `render.yaml` / `Procfile`)

**Frontend** (`revio-frontend/`)
- React 19 + Vite
- React Router v7, TanStack Query, Zustand
- Tailwind CSS v4
- Déploiement : Vercel (`vercel.json`)

## Structure du projet

```
Revio/
├── revio-backend/
│   └── apps/
│       ├── accounts/   # utilisateurs, auth, OAuth Google, notifications, bug report
│       ├── courses/    # upload et gestion des cours
│       └── study/      # flashcards, quiz, examens, IA (ai_service.py)
└── revio-frontend/
    └── src/
        ├── pages/       # Dashboard, Upload, CourseDetail, Quiz, Exam, Profile...
        ├── components/  # composants réutilisables (navbar, notifications...)
        ├── api/         # couche axios par domaine (auth, courses, study, bugs)
        └── stores/      # état global (auth) via Zustand
```

## Installation

### Prérequis
- Python 3.13+
- Node.js 20+
- Une clé API [Groq](https://console.groq.com/keys)

### Backend

```bash
cd revio-backend
python -m venv venv
./venv/Scripts/activate   # Windows — sous macOS/Linux : source venv/bin/activate
pip install -r requirements.txt
```

Crée un fichier `.env` à la racine de `revio-backend/` :

```env
SECRET_KEY=une-cle-secrete-django
DEBUG=True
GROQ_API_KEY=ta-cle-groq
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=ton-client-id-google.apps.googleusercontent.com
```

Puis lance les migrations et le serveur :

```bash
python manage.py migrate
python manage.py runserver
```

L'API est servie sur `http://localhost:8000/api/`.

### Frontend

```bash
cd revio-frontend
npm install
```

Crée un fichier `.env.local` :

```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=ton-client-id-google.apps.googleusercontent.com
```

Puis lance le serveur de développement :

```bash
npm run dev
```

L'app est servie sur `http://localhost:5173`.

## Routes API principales

| Endpoint | Description |
|---|---|
| `POST /api/auth/register/` | Inscription |
| `POST /api/auth/login/` | Connexion |
| `POST /api/auth/google/` | Connexion via Google OAuth |
| `GET /api/auth/profile/` | Profil de l'utilisateur connecté |
| `POST /api/courses/upload/` | Upload d'un cours (texte, PDF ou photo) |
| `POST /api/study/<id>/generate/` | Génération IA du contenu (résumé, flashcards, quiz) |
| `POST /api/study/<id>/professor/` | Poser une question au Prof IA |
| `POST /api/study/<id>/exam/start/` | Démarrer un examen blanc |

## Notes de développement

- Les tests automatisés sont minimaux pour le moment (backend et frontend) — à renforcer en priorité.
- Le fichier `.env` du backend n'est jamais commité (voir `.gitignore`).
