from groq import Groq
import os
import json

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

SYSTEM_PROMPT = """Tu es StudyBuddy, un assistant pédagogique expert.
Tu réponds TOUJOURS en JSON valide et rien d'autre.
Pas de texte avant ou après le JSON. Pas de balises markdown.
"""

def generate_study_content(content: str, is_premium: bool) -> dict:
    flashcard_count = 10 if is_premium else 5
    quiz_count = 5 if is_premium else 3

    prompt = f"""
À partir de ce cours, génère exactement ce JSON :
{{
  "flashcards": [
    {{"question": "...", "answer": "...", "difficulty": "easy|medium|hard"}}
  ],
  "quiz": [
    {{
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "A. ...",
      "explanation": "..."
    }}
  ],
  "summary": ["point clé 1", "point clé 2", "point clé 3", "point clé 4", "point clé 5"],
  "key_concepts": ["concept 1", "concept 2", "concept 3"]
}}

Règles :
- Génère exactement {flashcard_count} flashcards
- Génère exactement {quiz_count} questions de quiz
- 5 points dans le résumé
- 3 concepts clés
- Réponds UNIQUEMENT avec le JSON, rien d'autre

Voici le cours :
{content[:4000]}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=4000,
    )

    raw = response.choices[0].message.content.strip()

    # Nettoyer si markdown présent malgré tout
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


def ask_professor(content: str, question: str) -> str:
    """Le prof IA — répond à une question sur le cours (Premium)"""
    prompt = f"""
Voici le cours de l'étudiant :
{content[:3000]}

Question de l'étudiant : {question}

Réponds comme un professeur bienveillant et pédagogue.
Sois clair, concis, et donne des exemples si nécessaire.
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Tu es un professeur expert et bienveillant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1000,
    )
    return response.choices[0].message.content.strip()


def generate_revision_plan(content: str, exam_date: str, course_title: str) -> dict:
    """Génère un plan de révision personnalisé"""
    prompt = f"""
Cours : {course_title}
Date d'examen : {exam_date}

À partir de ce cours, génère un plan de révision en JSON :
{{
  "total_days": 7,
  "daily_plan": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "tasks": ["tâche 1", "tâche 2"],
      "duration_minutes": 45,
      "focus": "Introduction et concepts de base"
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