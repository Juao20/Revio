import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startExam, submitExam } from '../../api/study'
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, XCircle, Trophy, Lock, Unlock, Smile, Target, Frown } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import Alert from '../../components/ui/Alert'
import { getErrorMessage } from '../../lib/errors'

const DIFFICULTY_CONFIG = {
  easy: { label: 'Facile', questions: 10, minutes: 10 },
  medium: { label: 'Moyen', questions: 20, minutes: 20 },
  hard: { label: 'Difficile', questions: 30, minutes: 30 },
  final: { label: 'Examen Final', questions: 40, minutes: 60 },
}

function masteryLabel(score) {
  if (score < 50) return { text: 'Faible', color: 'text-danger' }
  if (score < 70) return { text: 'Moyen', color: 'text-warning' }
  if (score < 85) return { text: 'Bon', color: 'text-info' }
  if (score < 95) return { text: 'Très bon', color: 'text-accent' }
  return { text: 'Maîtrisé', color: 'text-success' }
}

export default function Exam() {
  const { id } = useParams()
  const navigate = useNavigate()
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
    mutationFn: ({ formattedAnswers, time }) => submitExam(id, examData.exam_id, formattedAnswers, time),
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

    submitMutation.mutate({ formattedAnswers, time: auto ? currentExamData.duration_seconds : timeUsed })
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const totalQuestions = examData?.questions?.length || 0
  const answeredCount = Object.keys(answers).length
  const isLastQuestion = current === totalQuestions - 1
  const currentQuestion = examData?.questions[current]

  // ---- SETUP ----
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-bg text-text font-sans">
        <nav className="border-b border-white/8 px-4 md:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(`/courses/${id}`)}
            aria-label="Retour"
            className="w-9 h-9 rounded-[10px] bg-surface-2 border border-white/10 flex items-center justify-center text-text-soft hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-bold text-sm">Mode examen</span>
        </nav>

        <div className="max-w-xl mx-auto px-4 md:px-6 py-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-warning/14 flex items-center justify-center mx-auto mb-4">
              <Trophy size={26} className="text-warning" />
            </div>
            <h1 className="text-xl font-extrabold mb-1.5">Examen blanc</h1>
            <p className="text-text-faint text-sm">Questions fraîches générées par l'IA — conditions réelles.</p>
          </div>

          <h3 className="font-bold text-sm mb-3">Choisis ta difficulté</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => key !== 'final' && setDifficulty(key)}
                disabled={key === 'final'}
                className={`p-5 rounded-2xl border-2 text-left relative transition-colors ${
                  key === 'final'
                    ? 'border-white/5 bg-surface/50 opacity-60 cursor-not-allowed'
                    : difficulty === key
                    ? 'border-accent bg-accent/10'
                    : 'border-white/10 bg-surface hover:bg-surface-2'
                }`}
              >
                {key === 'final' && (
                  <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold bg-warning/14 text-warning px-2 py-0.5 rounded-full">
                    <Lock size={10} />
                    75%
                  </span>
                )}
                <p className="font-bold text-sm">{config.label}</p>
                <p className="text-text-faint text-xs mt-1">~{config.questions} questions · {config.minutes} min</p>
              </button>
            ))}
          </div>

          <Card className="p-5 mb-6 border-warning/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={15} className="text-warning" />
              <h4 className="font-bold text-sm">Règles de l'examen</h4>
            </div>
            <ul className="space-y-1.5">
              {[
                "Questions fraîches générées par l'IA à chaque examen",
                'Pas de correction avant la fin',
                'Timer visible en permanence',
                'Soumission automatique à la fin du temps',
                "L'examen final se débloque à 75% de maîtrise",
              ].map((rule) => (
                <li key={rule} className="text-text-faint text-xs flex items-center gap-2">
                  <span className="w-1 h-1 bg-text-faint rounded-full shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </Card>

          <Button onClick={() => startMutation.mutate()} loading={startMutation.isPending} className="w-full" size="lg">
            {startMutation.isPending ? "L'IA prépare ton examen..." : "Démarrer l'examen"}
          </Button>

          {startMutation.isError && (
            <Alert tone="danger" className="mt-3">
              {getErrorMessage(startMutation.error, 'Impossible de démarrer cet examen.')}
            </Alert>
          )}
        </div>
      </div>
    )
  }

  // ---- EXAM ----
  if (phase === 'exam' && currentQuestion) {
    const isWarning = timeLeft < 60
    return (
      <div className="min-h-screen bg-bg text-text font-sans">
        <div className="border-b border-white/8 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 bg-bg/90 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">{DIFFICULTY_CONFIG[difficulty].label}</span>
            <span className="text-text-faint text-sm hidden sm:inline">{answeredCount}/{totalQuestions} répondues</span>
          </div>
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono font-bold text-base ${
              isWarning ? 'bg-danger/14 text-danger animate-pulse' : 'bg-surface-2 text-text'
            }`}
          >
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 md:px-6 py-6">
          <ProgressBar value={(answeredCount / totalQuestions) * 100} className="h-1.5 mb-4" />

          <div className="flex flex-wrap gap-1.5 mb-6">
            {examData.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-7 h-7 rounded-md text-xs font-bold transition-colors ${
                  i === current
                    ? 'bg-accent text-bg'
                    : answers[i] !== undefined
                    ? 'bg-success/20 text-success'
                    : 'bg-surface-2 text-text-faint hover:bg-surface-3'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Card className="p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-text-faint text-xs">Question {current + 1} sur {totalQuestions}</p>
              {currentQuestion.topic && (
                <span className="text-xs bg-surface-2 text-text-soft px-2 py-1 rounded-lg">{currentQuestion.topic}</span>
              )}
            </div>
            <p className="font-semibold text-lg leading-relaxed">{currentQuestion.question}</p>
          </Card>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => setAnswers((prev) => ({ ...prev, [current]: option }))}
                className={`w-full text-left border rounded-xl px-5 py-4 text-sm leading-relaxed transition-colors ${
                  answers[current] === option
                    ? 'bg-accent/14 border-accent/50 text-text'
                    : 'bg-surface border-white/10 text-text-soft hover:bg-surface-2'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex-1"
            >
              Précédente
            </Button>

            {isLastQuestion ? (
              <Button onClick={() => handleSubmit()} loading={submitMutation.isPending} className="flex-1">
                Terminer l'examen
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setCurrent((c) => Math.min(totalQuestions - 1, c + 1))}
                className="flex-1"
              >
                Suivante
              </Button>
            )}
          </div>

          {!isLastQuestion && answeredCount === totalQuestions && (
            <Button onClick={() => handleSubmit()} loading={submitMutation.isPending} className="w-full mt-3" variant="secondary">
              Tout répondu — Soumettre l'examen
            </Button>
          )}
        </div>
      </div>
    )
  }

  // ---- RESULT ----
  if (phase === 'result' && result) {
    const pct = result.percentage
    const mastery = masteryLabel(pct)
    const ResultIcon = pct >= 80 ? Trophy : pct >= 60 ? Smile : pct >= 40 ? Target : Frown
    const minutes = Math.floor(result.time_used_seconds / 60)
    const seconds = result.time_used_seconds % 60

    return (
      <div className="min-h-screen bg-bg text-text font-sans">
        <nav className="border-b border-white/8 px-4 md:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(`/courses/${id}`)}
            aria-label="Retour au cours"
            className="w-9 h-9 rounded-[10px] bg-surface-2 border border-white/10 flex items-center justify-center text-text-soft hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-bold text-sm">Résultats de l'examen</span>
        </nav>

        <div className="max-w-xl mx-auto px-4 md:px-6 py-8 space-y-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/14 flex items-center justify-center mx-auto mb-4">
              <ResultIcon size={28} className="text-accent" />
            </div>
            <p className="text-4xl font-extrabold mb-1">{pct}%</p>
            <p className={`text-base font-bold mb-2 ${mastery.color}`}>{mastery.text}</p>
            <p className="text-text-faint text-sm">{result.score} / {result.total_questions} bonnes réponses</p>

            <ProgressBar value={pct} className="h-2.5 mt-5 mb-2" />

            <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/8">
              <div>
                <p className="text-lg font-bold font-mono">{minutes}:{seconds.toString().padStart(2, '0')}</p>
                <p className="text-text-faint text-xs">Temps utilisé</p>
              </div>
              <div>
                <p className="text-lg font-bold text-warning">+{result.xp_earned} XP</p>
                <p className="text-text-faint text-xs">Gagnés</p>
              </div>
              <div>
                <p className="text-lg font-bold">{result.new_mastery}%</p>
                <p className="text-text-faint text-xs">Maîtrise cours</p>
              </div>
            </div>
          </Card>

          {result.exam_unlocked && difficulty !== 'final' && (
            <Card className="p-5 border-warning/25 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-warning/14 flex items-center justify-center shrink-0">
                <Unlock size={20} className="text-warning" />
              </div>
              <div>
                <p className="font-bold text-sm">Examen Final débloqué !</p>
                <p className="text-text-faint text-xs">Tu as atteint 75% de maîtrise sur ce cours</p>
              </div>
            </Card>
          )}

          <Button variant="secondary" onClick={() => setShowCorrection(!showCorrection)} className="w-full">
            {showCorrection ? 'Masquer la correction' : 'Voir la correction détaillée'}
          </Button>

          {showCorrection && (
            <div className="space-y-3">
              {result.detailed_answers.map((item, i) => (
                <Card key={i} className={`p-5 ${item.is_correct ? 'border-success/20' : 'border-danger/20'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    {item.is_correct ? (
                      <CheckCircle size={17} className="text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={17} className="text-danger shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{item.question}</p>
                      {item.topic && <span className="text-xs bg-surface-2 text-text-soft px-2 py-0.5 rounded-lg">{item.topic}</span>}
                    </div>
                  </div>

                  {!item.is_correct && (
                    <div className="pl-7 space-y-1 mt-2">
                      <p className="text-danger text-xs">Ta réponse : {item.selected_answer || 'Sans réponse'}</p>
                      <p className="text-success text-xs">Bonne réponse : {item.correct_answer}</p>
                    </div>
                  )}

                  {item.explanation && <p className="text-text-faint text-xs mt-2 pl-7 italic">{item.explanation}</p>}
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setPhase('setup')
                setAnswers({})
                setCurrent(0)
                setResult(null)
                setShowCorrection(false)
              }}
              className="flex-1"
            >
              Recommencer
            </Button>
            <Button onClick={() => navigate(`/courses/${id}`)} className="flex-1">
              Retour au cours
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
