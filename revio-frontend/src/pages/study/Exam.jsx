import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startExam, submitExam } from '../../api/study'
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Facile',       emoji: '😊', questions: 10, minutes: 10 },
  medium: { label: 'Moyen',        emoji: '🎯', questions: 20, minutes: 20 },
  hard:   { label: 'Difficile',    emoji: '🔥', questions: 30, minutes: 30 },
  final:  { label: 'Examen Final', emoji: '🏆', questions: 40, minutes: 60 },
}

const MASTERY_CONFIG = {
  label: (score) => {
    if (score < 50) return { text: 'Faible',   color: 'text-red-400' }
    if (score < 70) return { text: 'Moyen',    color: 'text-orange-400' }
    if (score < 85) return { text: 'Bon',      color: 'text-blue-400' }
    if (score < 95) return { text: 'Très bon', color: 'text-violet-400' }
    return             { text: 'Maîtrisé',  color: 'text-emerald-400' }
  }
}

export default function Exam() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const [phase, setPhase] = useState('setup')
  const [difficulty, setDifficulty] = useState('medium')
  const [examData, setExamData] = useState(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [timeUsed, setTimeUsed] = useState(0)
  const [result, setResult] = useState(null)
  const [showCorrection, setShowCorrection] = useState(false)
  const timerRef = useRef(null)
  const submittedRef = useRef(false)
  const answersRef = useRef(answers)
  const examDataRef = useRef(examData)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    examDataRef.current = examData
  }, [examData])

  useEffect(() => {
    if (phase !== 'exam') return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          if (!submittedRef.current) handleSubmit(true)
          return 0
        }
        return prev - 1
      })
      setTimeUsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const startMutation = useMutation({
    mutationFn: () => startExam(id, difficulty),
    onSuccess: (res) => {
      setExamData(res.data)
      setTimeLeft(res.data.duration_seconds)
      setAnswers({})
      setCurrent(0)
      submittedRef.current = false
      setPhase('exam')
    },
  })

  const submitMutation = useMutation({
    mutationFn: ({ formattedAnswers, time }) =>
      submitExam(id, examData.exam_id, formattedAnswers, time),
    onSuccess: (res) => {
      setResult(res.data)
      setPhase('result')
      queryClient.invalidateQueries(['profile'])
      queryClient.invalidateQueries(['course', id])
    },
  })

  const handleSubmit = (auto = false) => {
    if (submittedRef.current) return
    submittedRef.current = true
    clearInterval(timerRef.current)

    // Les questions viennent directement de l'IA (pas de quiz_id)
    const currentExamData = examDataRef.current
    const currentAnswers = answersRef.current
    const formattedAnswers = currentExamData.questions.map((q, i) => ({
      question: q.question,
      selected_answer: currentAnswers[i] || '',
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      topic: q.topic || '',
      difficulty: q.difficulty || '',
    }))

    submitMutation.mutate({
      formattedAnswers,
      time: auto ? currentExamData.duration_seconds : timeUsed,
    })
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const totalQuestions = examData?.questions?.length || 0
  const answeredCount = Object.keys(answers).length
  const isLastQuestion = current === totalQuestions - 1
  const currentQuestion = examData?.questions[current]

  // ---- PHASE SETUP ----
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">
        <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
          <Link to={`/courses/${id}`} className="text-indigo-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-white font-bold">Mode Examen Simulé</span>
        </nav>

        <div className="max-w-xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <span className="text-6xl block mb-4">🏆</span>
            <h1 className="text-2xl font-bold text-white mb-2">Mode Examen</h1>
            <p className="text-indigo-300 text-sm">
              Questions fraîches générées par l'IA — conditions réelles
            </p>
          </div>

          {/* Choix difficulté */}
          <h3 className="text-white font-semibold mb-4">Choisis ta difficulté</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => key !== 'final' && setDifficulty(key)}
                className={`p-5 rounded-2xl border-2 transition text-left relative ${
                  key === 'final'
                    ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                    : difficulty === key
                    ? 'border-violet-500 bg-violet-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {key === 'final' && (
                  <span className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                    🔒 75% maîtrise
                  </span>
                )}
                <span className="text-2xl block mb-2">{config.emoji}</span>
                <p className="text-white font-semibold">{config.label}</p>
                <p className="text-indigo-400 text-xs mt-1">
                  ~{config.questions} questions · {config.minutes} min
                </p>
              </button>
            ))}
          </div>

          {/* Règles */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-yellow-400" />
              <h4 className="text-yellow-300 font-semibold text-sm">Règles de l'examen</h4>
            </div>
            <ul className="space-y-2">
              {[
                'Questions fraîches générées par l\'IA à chaque examen',
                'Pas de correction avant la fin',
                'Timer visible en permanence',
                'Soumission automatique à la fin du temps',
                'Tu peux naviguer entre les questions',
                'L\'examen final se débloque à 75% de maîtrise',
              ].map((rule, i) => (
                <li key={i} className="text-yellow-200 text-xs flex items-center gap-2">
                  <span className="w-1 h-1 bg-yellow-400 rounded-full shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-2xl py-4 transition shadow-lg shadow-violet-500/30"
          >
            {startMutation.isPending ? '⏳ L\'IA prépare ton examen...' : '🚀 Démarrer l\'examen'}
          </button>

          {startMutation.isError && (
            <p className="text-red-400 text-sm text-center mt-3">
              {startMutation.error?.response?.data?.error || 'Erreur lors du démarrage'}
            </p>
          )}
        </div>
      </div>
    )
  }

  // ---- PHASE EXAM ----
  if (phase === 'exam' && currentQuestion) {
    const isWarning = timeLeft < 60
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

        {/* Header fixe */}
        <div className="border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 bg-violet-950/80 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-sm">
              {DIFFICULTY_CONFIG[difficulty].emoji} {DIFFICULTY_CONFIG[difficulty].label}
            </span>
            <span className="text-indigo-400 text-sm">
              {answeredCount}/{totalQuestions} répondues
            </span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
            isWarning
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
              : 'bg-white/10 text-white'
          }`}>
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-6">

          {/* Barre progression */}
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
            <div
              className="bg-violet-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Navigation questions */}
          <div className="flex flex-wrap gap-2 mb-6">
            {examData.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                  i === current
                    ? 'bg-violet-600 text-white'
                    : answers[i] !== undefined
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/10 text-indigo-300 hover:bg-white/20'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Question */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-indigo-400 text-xs">Question {current + 1} sur {totalQuestions}</p>
              {currentQuestion.topic && (
                <span className="text-xs bg-white/10 text-indigo-300 px-2 py-1 rounded-lg">
                  {currentQuestion.topic}
                </span>
              )}
            </div>
            <p className="text-white font-semibold text-lg leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => setAnswers((prev) => ({ ...prev, [current]: option }))}
                className={`w-full text-left border rounded-xl px-5 py-4 transition text-sm leading-relaxed ${
                  answers[current] === option
                    ? 'bg-violet-500/30 border-violet-500/60 text-white'
                    : 'bg-white/5 border-white/10 text-indigo-200 hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/20 text-white rounded-xl py-3 text-sm transition"
            >
              ← Précédente
            </button>

            {isLastQuestion ? (
              <button
                onClick={() => handleSubmit()}
                disabled={submitMutation.isPending}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition"
              >
                {submitMutation.isPending ? 'Envoi...' : '✅ Terminer l\'examen'}
              </button>
            ) : (
              <button
                onClick={() => setCurrent((c) => Math.min(totalQuestions - 1, c + 1))}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-3 text-sm transition"
              >
                Suivante →
              </button>
            )}
          </div>

          {/* Soumettre si tout répondu */}
          {!isLastQuestion && answeredCount === totalQuestions && (
            <button
              onClick={() => handleSubmit()}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3 text-sm transition"
            >
              ✅ Tout répondu — Soumettre l'examen
            </button>
          )}
        </div>
      </div>
    )
  }

  // ---- PHASE RESULT ----
  if (phase === 'result' && result) {
    const pct = result.percentage
    const mastery = MASTERY_CONFIG.label(pct)
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : pct >= 40 ? '💪' : '😅'
    const minutes = Math.floor(result.time_used_seconds / 60)
    const seconds = result.time_used_seconds % 60

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">
        <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
          <Link to={`/courses/${id}`} className="text-indigo-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-white font-bold">Résultats de l'examen</span>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">

          {/* Score principal */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
            <span className="text-6xl block mb-3">{emoji}</span>
            <p className="text-5xl font-bold text-white mb-1">{pct}%</p>
            <p className={`text-lg font-semibold mb-2 ${mastery.color}`}>{mastery.text}</p>
            <p className="text-indigo-300 text-sm">
              {result.score} / {result.total_questions} bonnes réponses
            </p>

            {/* Barre score */}
            <div className="w-full bg-white/10 rounded-full h-3 mt-5 mb-2">
              <div
                className={`h-3 rounded-full transition-all ${
                  pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10">
              <div>
                <p className="text-xl font-bold text-white">{minutes}:{seconds.toString().padStart(2, '0')}</p>
                <p className="text-indigo-400 text-xs">Temps utilisé</p>
              </div>
              <div>
                <p className="text-xl font-bold text-yellow-400">+{result.xp_earned} XP</p>
                <p className="text-indigo-400 text-xs">Gagnés</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{result.new_mastery}%</p>
                <p className="text-indigo-400 text-xs">Maîtrise cours</p>
              </div>
            </div>
          </div>

          {/* Examen final débloqué ? */}
          {result.exam_unlocked && difficulty !== 'final' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-3xl">🔓</span>
              <div>
                <p className="text-yellow-300 font-semibold">Examen Final débloqué !</p>
                <p className="text-yellow-400 text-sm">Tu as atteint 75% de maîtrise sur ce cours</p>
              </div>
            </div>
          )}

          {/* Correction */}
          <button
            onClick={() => setShowCorrection(!showCorrection)}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-3 transition text-sm"
          >
            {showCorrection ? 'Masquer la correction' : '📋 Voir la correction détaillée'}
          </button>

          {showCorrection && (
            <div className="space-y-3">
              {result.detailed_answers.map((item, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-5 border ${
                    item.is_correct
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {item.is_correct
                      ? <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      : <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium mb-1">{item.question}</p>
                      {item.topic && (
                        <span className="text-xs bg-white/10 text-indigo-300 px-2 py-0.5 rounded-lg">
                          {item.topic}
                        </span>
                      )}
                    </div>
                  </div>

                  {!item.is_correct && (
                    <div className="pl-7 space-y-1 mt-2">
                      <p className="text-red-300 text-xs">
                        Ta réponse : {item.selected_answer || 'Sans réponse'}
                      </p>
                      <p className="text-emerald-300 text-xs">
                        Bonne réponse : {item.correct_answer}
                      </p>
                    </div>
                  )}

                  {item.explanation && (
                    <p className="text-indigo-300 text-xs mt-2 pl-7 italic">
                      💡 {item.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPhase('setup')
                setAnswers({})
                setCurrent(0)
                setResult(null)
                setShowCorrection(false)
              }}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-3 font-medium transition text-sm"
            >
              Recommencer
            </button>
            <Link
              to={`/courses/${id}`}
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-3 font-medium transition text-center text-sm"
            >
              Retour au cours
            </Link>
          </div>

        </div>
      </div>
    )
  }
}