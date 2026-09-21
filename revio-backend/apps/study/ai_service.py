from groq import Groq
import os
import json
import base64

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

SYSTEM_PROMPT = """Tu es Revio, un assistant pédagogique expert.
Tu réponds TOUJOURS en JSON valide et rien d'autre.
Pas de texte avant ou après le JSON. Pas de balises markdown.
"""

def analyze_course(content: str) -> dict:
    """Analyse le cours et détecte les concepts"""
    word_count = len(content.split())

    if word_count < 300:
        size = 'small'
        flashcards = (15, 25)
        quiz = (5, 10)
    elif word_count < 800:
        size = 'medium'
        flashcards = (25, 50)
        quiz = (10, 15)
    elif word_count < 2000:
        size = 'large'
        flashcards = (50, 80)
        quiz = (15, 25)
    else:
        size = 'xlarge'
        flashcards = (80, 120)
        quiz = (25, 30)

    return {
        'size': size,
        'word_count': word_count,
        'flashcards_range': flashcards,
        'quiz_range': quiz,
    }


def detect_concepts(content: str) -> dict:
    """Détecte les concepts clés du cours avant de générer le contenu"""
    prompt = f"""
Analyse ce cours et retourne ce JSON :
{{
  "concepts": ["concept 1", "concept 2", ...],
  "concept_count": 12,
  "difficulty": "easy|medium|hard",
  "estimated_study_time_minutes": 90,
  "course_type": "sciences|histoire|langues|maths|autre"
}}

Règles :
- Liste TOUS les concepts importants du cours
- concept_count = nombre exact de concepts détectés
- difficulty = difficulté globale du cours
- estimated_study_time_minutes = temps réaliste pour maîtriser ce cours

Cours :
{content[:4000]}
"""
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=2000,
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def generate_study_content(content: str) -> dict:
    analysis = analyze_course(content)

    # Détecter les concepts d'abord
    concepts_data = detect_concepts(content)
    concept_count = concepts_data.get('concept_count', 10)

    # Calculer les quantités selon les concepts
    raw_flashcards = min(concept_count * 3, 120)
    raw_quiz = min(concept_count // 2, 30)

    # Borner dans les ranges selon la taille
    fc_min, fc_max = analysis['flashcards_range']
    qz_min, qz_max = analysis['quiz_range']

    flashcard_count = max(fc_min, min(raw_flashcards, fc_max))
    quiz_count = max(qz_min, min(raw_quiz, qz_max))

    prompt = f"""
Tu es un professeur expert. Analyse ce cours en profondeur et génère ce JSON :
{{
  "flashcards": [
    {{
      "question": "...",
      "answer": "...",
      "difficulty": "easy|medium|hard",
      "topic": "nom du concept/thème",
      "type": "definition|exemple|application|piege|formule"
    }}
  ],
  "quiz": [
    {{
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "A. ...",
      "explanation": "...",
      "topic": "nom du concept/thème",
      "difficulty": "easy|medium|hard",
      "level": "fondamentaux|comprehension|application|pieges"
    }}
  ],
  "summary": [
    {{
      "title": "Titre de la partie",
      "content": "Explication claire et complète en 2-3 phrases"
    }}
  ],
  "key_concepts": ["concept 1", "concept 2", "concept 3"],
  "estimated_mastery_time": "2h30",
  "concept_count": {concept_count}
}}

Règles IMPORTANTES :
- Génère exactement {flashcard_count} flashcards couvrant TOUS les concepts
- Types de flashcards variés : définition, exemple, application, piège, formule
- Génère exactement {quiz_count} questions de quiz
- Répartis les quiz en 4 niveaux : fondamentaux, comprehension, application, pieges
- Varie les difficultés : 40% easy, 40% medium, 20% hard
- Le résumé doit couvrir intelligemment TOUTES les parties du cours
- Chaque concept important doit avoir au moins une flashcard

Cours ({analysis['word_count']} mots, {concept_count} concepts) :
{content[:6000]}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=8000,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    data = json.loads(raw.strip())
    data['concepts_data'] = concepts_data
    return data


def generate_exam_questions(content: str, difficulty: str, course_title: str) -> list:
    """
    Génère des questions d'examen FRAÎCHES — différentes des quiz de révision.
    Basé sur la difficulté choisie.
    """
    EXAM_CONFIG = {
        'easy':   {'count': 10, 'easy_pct': 80, 'medium_pct': 20, 'hard_pct': 0,  'minutes': 10},
        'medium': {'count': 20, 'easy_pct': 50, 'medium_pct': 40, 'hard_pct': 10, 'minutes': 20},
        'hard':   {'count': 30, 'easy_pct': 20, 'medium_pct': 50, 'hard_pct': 30, 'minutes': 30},
        'final':  {'count': 40, 'easy_pct': 20, 'medium_pct': 40, 'hard_pct': 40, 'minutes': 60},
    }

    config = EXAM_CONFIG.get(difficulty, EXAM_CONFIG['medium'])

    easy_count = round(config['count'] * config['easy_pct'] / 100)
    medium_count = round(config['count'] * config['medium_pct'] / 100)
    hard_count = config['count'] - easy_count - medium_count

    prompt = f"""
Tu es un examinateur expert pour le cours : "{course_title}".

Génère exactement {config['count']} questions d'examen NOUVELLES (pas les mêmes que les quiz de révision) en JSON :
{{
  "questions": [
    {{
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "A. ...",
      "explanation": "...",
      "topic": "...",
      "difficulty": "easy|medium|hard"
    }}
  ],
  "duration_minutes": {config['minutes']}
}}

Répartition OBLIGATOIRE :
- {easy_count} questions faciles (concepts de base, définitions)
- {medium_count} questions moyennes (compréhension, application)
- {hard_count} questions difficiles (analyse, pièges, cas complexes)

Règles :
- Questions DIFFÉRENTES et plus poussées que les quiz de révision
- Couvre TOUS les aspects importants du cours
- Inclus des pièges et cas limites pour les questions difficiles
- Chaque question doit avoir une explication détaillée

Contenu du cours :
{content[:5000]}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.8,
        max_tokens=8000,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    data = json.loads(raw.strip())
    return data


def ask_professor(content: str, question: str, history: list = []) -> str:
    messages = [
        {
            "role": "system",
            "content": f"""Tu es un professeur bienveillant et pédagogue.
Tu réponds aux questions sur ce cours de façon claire, concise et avec des exemples si nécessaire.

Voici le cours :
{content[:3000]}"""
        }
    ]
    for msg in history:
        messages.append(msg)
    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
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
        model="openai/gpt-oss-120b",
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
    return json.loads(raw.strip())

def extract_text_from_image(image_data: bytes, media_type: str) -> str:
    """Extrait le texte d'une photo de cours via Groq Vision"""
    base64_image = base64.b64encode(image_data).decode('utf-8')

    response = client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{base64_image}"
                        }
                    },
                    {
                        "type": "text",
                        "text": """Tu es un expert en extraction de texte de documents.
Extrait TOUT le texte visible sur cette image de cours de manière fidèle et structurée.
Conserve la structure du document : titres, sous-titres, paragraphes, listes, formules.
Si c'est flou ou illisible, indique-le clairement.
Réponds uniquement avec le texte extrait, sans commentaire."""
                    }
                ]
            }
        ],
        max_tokens=4000,
    )
    return response.choices[0].message.content.strip()