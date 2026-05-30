from groq import Groq
import os
import json

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

SYSTEM_PROMPT = """Tu es StudyBuddy, un assistant pédagogique expert.
Tu réponds TOUJOURS en JSON valide et rien d'autre.
Pas de texte avant ou après le JSON. Pas de balises markdown.
"""

def analyze_course(content: str) -> dict:
    """Analyse la taille et complexité du cours pour adapter la génération"""
    word_count = len(content.split())
    
    if word_count < 300:
        return {'size': 'small', 'flashcards': 5, 'quiz': 3, 'summary_points': 3}
    elif word_count < 800:
        return {'size': 'medium', 'flashcards': 10, 'quiz': 5, 'summary_points': 5}
    elif word_count < 2000:
        return {'size': 'large', 'flashcards': 15, 'quiz': 8, 'summary_points': 7}
    else:
        return {'size': 'xlarge', 'flashcards': 20, 'quiz': 10, 'summary_points': 10}


def generate_study_content(content: str, is_premium: bool) -> dict:
    analysis = analyze_course(content)

    # Limiter pour les gratuits
    flashcard_count = analysis['flashcards'] if is_premium else min(analysis['flashcards'], 5)
    quiz_count = analysis['quiz'] if is_premium else min(analysis['quiz'], 3)
    summary_points = analysis['summary_points']

    prompt = f"""
Tu es un professeur expert. Analyse ce cours en profondeur et génère ce JSON :
{{
  "flashcards": [
    {{
      "question": "...",
      "answer": "...",
      "difficulty": "easy|medium|hard",
      "topic": "nom du thème/chapitre"
    }}
  ],
  "quiz": [
    {{
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "A. ...",
      "explanation": "...",
      "topic": "nom du thème/chapitre"
    }}
  ],
  "summary": [
    {{
      "title": "Titre de la partie",
      "content": "Explication claire et complète de cette partie en 2-3 phrases"
    }}
  ],
  "key_concepts": ["concept 1", "concept 2", "concept 3"],
  "estimated_mastery_time": "2h30"
}}

Règles IMPORTANTES :
- Génère exactement {flashcard_count} flashcards couvrant TOUTES les parties du cours
- Génère exactement {quiz_count} questions de quiz variées
- Le résumé doit avoir exactement {summary_points} parties qui couvrent INTELLIGEMMENT l'ensemble du cours
- Chaque partie du résumé doit avoir un titre clair et un contenu substantiel
- Les flashcards et quiz doivent couvrir proportionnellement toutes les parties du cours
- Varie les difficultés : 40% easy, 40% medium, 20% hard
- Le champ "topic" doit correspondre aux vraies parties du cours
- estimated_mastery_time = temps estimé pour maîtriser ce cours

Voici le cours ({len(content.split())} mots) :
{content[:6000]}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=6000,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


def ask_professor(content: str, question: str, history: list = []) -> str:
    """Le prof IA — mode chat avec historique"""
    messages = [
        {
            "role": "system",
            "content": f"""Tu es un professeur bienveillant et pédagogue.
Tu réponds aux questions sur ce cours de façon claire, concise et avec des exemples si nécessaire.
Tu gardes en mémoire l'historique de la conversation.

Voici le cours :
{content[:3000]}"""
        }
    ]

    # Ajouter l'historique
    for msg in history:
        messages.append(msg)

    # Ajouter la nouvelle question
    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=1000,
    )
    return response.choices[0].message.content.strip()


def generate_revision_plan(content: str, exam_date: str, course_title: str) -> dict:
    prompt = f"""
Cours : {course_title}
Date d'examen : {exam_date}
Taille du cours : {len(content.split())} mots

Génère un plan de révision intelligent en JSON :
{{
  "total_days": 7,
  "daily_plan": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "tasks": ["tâche 1", "tâche 2"],
      "duration_minutes": 45,
      "focus": "Titre de la partie à réviser"
    }}
  ],
  "tips": ["conseil 1", "conseil 2", "conseil 3"]
}}

Contenu du cours :
{content[:2000]}
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)