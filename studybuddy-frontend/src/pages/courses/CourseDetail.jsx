import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCourse, deleteCourse } from '../../api/courses'
import { generateContent, getFlashcards, getQuizzes } from '../../api/study'
import { ArrowLeft, Zap, BookOpen, Brain, Trash2, Calendar } from 'lucide-react'

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('summary')
  const [flipped, setFlipped] = useState({})

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id).then((r) => r.data),
  })

  const { data: flashcards = [] } = useQuery({
    queryKey: ['flashcards', id],
    queryFn: () => getFlashcards(id).then((r) => r.data),
  })

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => getQuizzes(id).then((r) => r.data),
  })

  const generateMutation = useMutation({
    mutationFn: () => generateContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcards', id])
      queryClient.invalidateQueries(['quizzes', id])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses'])
      navigate('/')
    },
  })

  const toggleFlip = (cardId) => {
    setFlipped((prev) => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  const difficultyColor = {
    easy: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    hard: 'text-red-400 bg-red-500/20 border-red-500/30',
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex items-center justify-center">
        <p className="text-indigo-300">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-indigo-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-white font-bold text-lg truncate max-w-xs">{course?.title}</span>
        </div>
        <button
          onClick={() => deleteMutation.mutate()}
          className="text-red-400 hover:text-red-300 transition"
        >
          <Trash2 size={18} />
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="flex flex-col items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-2xl py-4 transition shadow-lg shadow-violet-500/20"
          >
            <Zap size={20} />
            <span className="text-xs font-medium">
              {generateMutation.isPending ? 'Génération...' : 'Générer IA'}
            </span>
          </button>

          <Link
            to={`/courses/${id}/quiz`}
            className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl py-4 transition"
          >
            <Brain size={20} />
            <span className="text-xs font-medium">Quiz</span>
          </Link>

          <Link
            to={`/courses/${id}/plan`}
            className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl py-4 transition"
          >
            <Calendar size={20} />
            <span className="text-xs font-medium">Plan de révision</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/10 rounded-2xl p-1 mb-6">
          {[
            { key: 'summary', label: '📋 Résumé' },
            { key: 'flashcards', label: `🃏 Flashcards (${flashcards.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-indigo-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab — Résumé */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {generateMutation.data ? (
              <>
                {/* Points clés */}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-violet-400" />
                    Points clés
                  </h3>
                  <ul className="space-y-3">
                    {generateMutation.data.data.summary.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-violet-500/30 text-violet-300 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-indigo-200 text-sm leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concepts clés */}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4">⭐ Concepts clés</h3>
                  <div className="flex flex-wrap gap-2">
                    {generateMutation.data.data.key_concepts.map((concept, i) => (
                      <span
                        key={i}
                        className="bg-violet-500/20 border border-violet-500/30 text-violet-300 px-4 py-2 rounded-xl text-sm font-medium"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-5xl mb-4 block">✨</span>
                <p className="text-indigo-300">Clique sur "Générer IA" pour créer le résumé</p>
              </div>
            )}
          </div>
        )}

        {/* Tab — Flashcards */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            {flashcards.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-5xl mb-4 block">🃏</span>
                <p className="text-indigo-300">Aucune flashcard pour l'instant</p>
                <p className="text-indigo-400 text-sm mt-1">Clique sur "Générer IA" pour en créer</p>
              </div>
            ) : (
              flashcards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => toggleFlip(card.id)}
                  className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-6 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${difficultyColor[card.difficulty]}`}>
                      {card.difficulty}
                    </span>
                    <span className="text-indigo-400 text-xs">
                      {flipped[card.id] ? 'Réponse' : 'Question'} — clique pour retourner
                    </span>
                  </div>
                  <p className="text-white font-medium leading-relaxed">
                    {flipped[card.id] ? card.answer : card.question}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}