import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getQuizzes, saveSession, submitQuizAnswer } from '../../api/study'
import { ArrowLeft, CheckCircle, XCircle, Brain, Lightbulb, PartyPopper } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [startTime] = useState(() => Date.now())

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => getQuizzes(id).then((r) => r.data),
  })

  const sessionMutation = useMutation({ mutationFn: saveSession })
  const answerMutation = useMutation({ mutationFn: ({ quizId, option }) => submitQuizAnswer(id, quizId, option) })

  const currentQuiz = quizzes[current]
  const isCorrect = selected === currentQuiz?.correct_answer

  const handleSelect = (option) => {
    if (selected) return
    setSelected(option)
    answerMutation.mutate({ quizId: currentQuiz.id, option })
  }

  const handleNext = () => {
    const newAnswers = [...answers, { correct: isCorrect }]
    setAnswers(newAnswers)

    if (current + 1 >= quizzes.length) {
      const score = newAnswers.filter((a) => a.correct).length
      const duration = Math.floor((Date.now() - startTime) / 1000)
      sessionMutation.mutate({ course: id, score, total_questions: quizzes.length, duration })
      setShowResult(true)
    } else {
      setCurrent(current + 1)
      setSelected(null)
    }
  }

  const handleRestart = () => {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setShowResult(false)
  }

  const score = answers.filter((a) => a.correct).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <Skeleton className="w-full max-w-xl h-72" />
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <EmptyState
          icon={Brain}
          title="Aucun quiz disponible"
          description="Génère le contenu IA de ce cours pour obtenir un quiz."
          action={
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(`/courses/${id}`)}>
              Retour au cours
            </Button>
          }
        />
      </div>
    )
  }

  if (showResult) {
    const percentage = Math.round((score / quizzes.length) * 100)
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/14 flex items-center justify-center mx-auto mb-4">
            <PartyPopper size={26} className="text-accent" />
          </div>
          <h2 className="text-xl font-bold mb-1">Quiz terminé !</h2>
          <p className="text-text-faint text-sm mb-6">Voici tes résultats</p>

          <div className="bg-surface-2 rounded-2xl p-6 mb-6">
            <p className="text-4xl font-extrabold mb-1">{percentage}%</p>
            <p className="text-text-faint text-sm">
              {score} bonne{score > 1 ? 's' : ''} réponse{score > 1 ? 's' : ''} sur {quizzes.length}
            </p>
          </div>

          <ProgressBar value={percentage} className="h-2.5 mb-8" />

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleRestart} className="flex-1">
              Recommencer
            </Button>
            <Button onClick={() => navigate(`/courses/${id}`)} className="flex-1">
              Retour au cours
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <nav className="border-b border-white/8 px-4 md:px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(`/courses/${id}`)}
          aria-label="Quitter le quiz"
          className="w-9 h-9 rounded-[10px] bg-surface-2 border border-white/10 flex items-center justify-center text-text-soft hover:text-text transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="font-bold text-sm">Quiz interactif</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-text-faint text-sm">Question {current + 1} sur {quizzes.length}</span>
          <span className="text-text-faint text-sm">{score} correcte{score > 1 ? 's' : ''}</span>
        </div>
        <ProgressBar value={(current / quizzes.length) * 100} className="h-1.5 mb-8" />

        <Card className="p-6 mb-6">
          <p className="font-semibold text-lg leading-relaxed">{currentQuiz.question}</p>
        </Card>

        <div className="space-y-3 mb-6">
          {currentQuiz.options.map((option, i) => {
            let style = 'bg-surface border-white/10 text-text-soft hover:bg-surface-2'
            if (selected) {
              if (option === currentQuiz.correct_answer) style = 'bg-success/14 border-success/40 text-success'
              else if (option === selected && !isCorrect) style = 'bg-danger/14 border-danger/40 text-danger'
              else style = 'bg-surface border-white/5 text-text-faint opacity-60'
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                className={`w-full text-left border rounded-xl px-5 py-4 transition-colors flex items-center justify-between ${style}`}
              >
                <span className="text-sm leading-relaxed">{option}</span>
                {selected && option === currentQuiz.correct_answer && <CheckCircle size={18} className="shrink-0" />}
                {selected && option === selected && !isCorrect && <XCircle size={18} className="shrink-0" />}
              </button>
            )
          })}
        </div>

        {selected && currentQuiz.explanation && (
          <div className="flex items-start gap-3 bg-info/10 border border-info/20 rounded-xl px-5 py-4 mb-6">
            <Lightbulb size={16} className="text-info shrink-0 mt-0.5" />
            <p className="text-sm text-text-soft leading-relaxed">{currentQuiz.explanation}</p>
          </div>
        )}

        {selected && (
          <Button onClick={handleNext} className="w-full" size="lg">
            {current + 1 >= quizzes.length ? 'Voir les résultats' : 'Question suivante'}
          </Button>
        )}
      </div>
    </div>
  )
}
