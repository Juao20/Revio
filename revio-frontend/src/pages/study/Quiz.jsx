import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getQuizzes, saveSession, submitQuizAnswer } from '../../api/study'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

export default function Quiz() {
  const { id } = useParams()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [startTime] = useState(Date.now())

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => getQuizzes(id).then((r) => r.data),
  })

  const sessionMutation = useMutation({
    mutationFn: saveSession,
  })

  const answerMutation = useMutation({
    mutationFn: ({ quizId, option }) => submitQuizAnswer(id, quizId, option),
  })

  const currentQuiz = quizzes[current]
  const isCorrect = selected === currentQuiz?.correct_answer

  const handleSelect = (option) => {
    if (selected) return // déjà répondu
    setSelected(option)
    answerMutation.mutate({ quizId: currentQuiz.id, option })
  }

  const handleNext = () => {
    const newAnswers = [...answers, { correct: isCorrect }]
    setAnswers(newAnswers)

    if (current + 1 >= quizzes.length) {
      // Fin du quiz
      const score = newAnswers.filter((a) => a.correct).length
      const duration = Math.floor((Date.now() - startTime) / 1000)
      sessionMutation.mutate({
        course: id,
        score,
        total_questions: quizzes.length,
        duration,
      })
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
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex items-center justify-center">
        <p className="text-indigo-300">Chargement du quiz...</p>
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">🧠</span>
          <p className="text-indigo-300 mb-4">Aucun quiz disponible</p>
          <Link
            to={`/courses/${id}`}
            className="text-violet-400 hover:text-violet-300 flex items-center gap-2 justify-center"
          >
            <ArrowLeft size={16} />
            Retour au cours
          </Link>
        </div>
      </div>
    )
  }

  // Résultat final
  if (showResult) {
    const percentage = Math.round((score / quizzes.length) * 100)
    const emoji = percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center">
            <span className="text-6xl block mb-4">{emoji}</span>
            <h2 className="text-2xl font-bold text-white mb-2">Quiz terminé !</h2>
            <p className="text-indigo-300 mb-6">Voici tes résultats</p>

            {/* Score */}
            <div className="bg-violet-500/20 border border-violet-500/30 rounded-2xl p-6 mb-6">
              <p className="text-5xl font-bold text-white mb-1">{percentage}%</p>
              <p className="text-indigo-300 text-sm">
                {score} bonne{score > 1 ? 's' : ''} réponse{score > 1 ? 's' : ''} sur {quizzes.length}
              </p>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-white/10 rounded-full h-3 mb-8">
              <div
                className="bg-violet-500 h-3 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-3 font-medium transition"
              >
                Recommencer
              </button>
              <Link
                to={`/courses/${id}`}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-3 font-medium transition text-center"
              >
                Retour au cours
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to={`/courses/${id}`} className="text-indigo-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-white font-bold">Quiz interactif</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Progression */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-indigo-300 text-sm">
            Question {current + 1} sur {quizzes.length}
          </span>
          <span className="text-indigo-300 text-sm">
            ✅ {answers.filter((a) => a.correct).length} correctes
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-8">
          <div
            className="bg-violet-500 h-2 rounded-full transition-all"
            style={{ width: `${((current) / quizzes.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <p className="text-white font-semibold text-lg leading-relaxed">
            {currentQuiz.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuiz.options.map((option, i) => {
            let style = 'bg-white/10 border-white/20 text-indigo-200 hover:bg-white/20'

            if (selected) {
              if (option === currentQuiz.correct_answer) {
                style = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              } else if (option === selected && !isCorrect) {
                style = 'bg-red-500/20 border-red-500/50 text-red-300'
              } else {
                style = 'bg-white/5 border-white/10 text-indigo-400 opacity-60'
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                className={`w-full text-left border rounded-xl px-5 py-4 transition flex items-center justify-between ${style}`}
              >
                <span className="text-sm leading-relaxed">{option}</span>
                {selected && option === currentQuiz.correct_answer && (
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                )}
                {selected && option === selected && !isCorrect && (
                  <XCircle size={18} className="text-red-400 shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Explication */}
        {selected && currentQuiz.explanation && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-5 py-4 mb-6">
            <p className="text-indigo-200 text-sm leading-relaxed">
              💡 {currentQuiz.explanation}
            </p>
          </div>
        )}

        {/* Bouton suivant */}
        {selected && (
          <button
            onClick={handleNext}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-4 transition shadow-lg shadow-violet-500/30"
          >
            {current + 1 >= quizzes.length ? 'Voir les résultats 🎉' : 'Question suivante →'}
          </button>
        )}

      </div>
    </div>
  )
}