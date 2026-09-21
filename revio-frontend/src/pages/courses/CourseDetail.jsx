import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCourse, deleteCourse } from '../../api/courses'
import { generateContent, getFlashcards, getQuizzes, reviewFlashcard, getWeakPoints, askProfessor } from '../../api/study'
import { ArrowLeft, Zap, Brain, Trash2, Calendar, Send, Clock, Target, Trophy } from 'lucide-react'
import { addPhotoToCourse } from '../../api/courses'

const difficultyColor = {
  easy: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  hard: 'text-red-400 bg-red-500/20 border-red-500/30',
}

const qualityButtons = [
  { value: 0, label: '😵 Raté', color: 'bg-red-500/20 hover:bg-red-500/40 text-red-300 border-red-500/30' },
  { value: 3, label: '😐 Difficile', color: 'bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 border-yellow-500/30' },
  { value: 4, label: '🙂 Bien', color: 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border-blue-500/30' },
  { value: 5, label: '😎 Parfait', color: 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border-emerald-500/30' },
]

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('summary')
  const [flipped, setFlipped] = useState({})
  const [chatHistory, setChatHistory] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState(null)
  const [addingPhoto, setAddingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id).then((r) => r.data),
  })

  const { data: flashcards = [], refetch: refetchFlashcards } = useQuery({
    queryKey: ['flashcards', id],
    queryFn: () => getFlashcards(id).then((r) => r.data),
  })

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => getQuizzes(id).then((r) => r.data),
  })

  const { data: weakPoints } = useQuery({
    queryKey: ['weak-points', id],
    queryFn: () => getWeakPoints(id).then((r) => r.data),
    retry: false,
  })

  const generateMutation = useMutation({
    mutationFn: () => generateContent(id),
    onSuccess: (res) => {
      setGeneratedData(res.data)
      queryClient.invalidateQueries(['flashcards', id])
      queryClient.invalidateQueries(['quizzes', id])
      queryClient.invalidateQueries(['profile'])
    },
  })

  const reviewMutation = useMutation({
    mutationFn: ({ flashcardId, quality }) => reviewFlashcard(id, flashcardId, quality),
    onSuccess: () => refetchFlashcards(),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses'])
      navigate('/')
    },
  })

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return

    const question = chatInput.trim()
    setChatInput('')
    setChatLoading(true)

    // Ajouter la question dans le chat
    const newHistory = [...chatHistory, { role: 'user', content: question }]
    setChatHistory(newHistory)

    try {
      const res = await askProfessor(id, question, chatHistory)
      setChatHistory([...newHistory, { role: 'assistant', content: res.data.answer }])
      queryClient.invalidateQueries(['profile'])
    } catch (err) {
      setChatHistory([...newHistory, {
        role: 'assistant',
        content: err.response?.data?.error || 'Erreur lors de la connexion au Prof IA'
      }])
    } finally {
      setChatLoading(false)
    }
  }

  const toggleFlip = (cardId) => {
    setFlipped((prev) => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  const handleAddPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAddingPhoto(true)
    setPhotoError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      await addPhotoToCourse(id, formData)
      queryClient.invalidateQueries(['course', id])
    } catch (err) {
      setPhotoError(err.response?.data?.error || 'Erreur lors de l\'ajout de la photo')
    } finally {
      setAddingPhoto(false)
    }
  }

  const tabs = [
    { key: 'summary', label: '📋 Résumé' },
    { key: 'flashcards', label: `🃏 Flashcards (${flashcards.length})` },
    { key: 'professor', label: '🎓 Prof IA' },
    { key: 'weakpoints', label: '🎯 Points faibles' },
  ]

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
        {/* Maîtrise du cours */}
        {course?.mastery_score > 0 && (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo-300 text-sm">Maîtrise du cours</span>
              <span className="text-white font-bold">{course.mastery_score}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  course.mastery_score >= 85 ? 'bg-emerald-500'
                  : course.mastery_score >= 70 ? 'bg-blue-500'
                  : course.mastery_score >= 50 ? 'bg-yellow-500'
                  : 'bg-red-500'
                }`}
                style={{ width: `${course.mastery_score}%` }}
              />
            </div>
            <p className="text-indigo-400 text-xs">{course.mastery_label}</p>
          </div>
        )}

        {/* Grille actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
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
            <span className="text-xs font-medium">Quiz ({quizzes.length})</span>
          </Link>

          <Link
            to={`/courses/${id}/plan`}
            className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl py-4 transition"
          >
            <Calendar size={20} />
            <span className="text-xs font-medium">Plan révision</span>
          </Link>

          <Link
            to={`/courses/${id}/exam`}
            className="flex flex-col items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 rounded-2xl py-4 transition"
          >
            <Trophy size={20} />
            <span className="text-xs font-medium">Examen</span>
            {course?.exam_unlocked && (
              <span className="text-xs text-yellow-400">Final 🔓</span>
            )}
          </Link>
        </div>
        {/* Temps de maîtrise estimé */}
        {generatedData?.estimated_mastery_time && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
            <Clock size={16} className="text-indigo-400" />
            <p className="text-indigo-300 text-sm">
              Temps estimé pour maîtriser ce cours :
              <span className="text-white font-semibold ml-1">{generatedData.estimated_mastery_time}</span>
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white/10 rounded-2xl p-1 mb-6 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition ${
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
            {(course?.summary?.length > 0) ? (
              <>
                {/* Temps de maîtrise */}
                {course?.estimated_mastery_time && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-5 py-3 flex items-center gap-3">
                    <Clock size={16} className="text-indigo-400" />
                    <p className="text-indigo-300 text-sm">
                      Temps estimé pour maîtriser ce cours :
                      <span className="text-white font-semibold ml-1">{course.estimated_mastery_time}</span>
                    </p>
                  </div>
                )}

                {/* Concepts clés */}
                {course?.key_concepts?.length > 0 && (
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-3">⭐ Concepts clés</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.key_concepts.map((concept, i) => (
                        <span key={i} className="bg-violet-500/20 border border-violet-500/30 text-violet-300 px-3 py-1.5 rounded-xl text-sm font-medium">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Résumé par parties */}
                <div className="space-y-3">
                  <h3 className="text-white font-semibold">📋 Résumé du cours</h3>
                  {course.summary.map((part, i) => (
                    <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-7 h-7 bg-violet-500/30 text-violet-300 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <h4 className="text-white font-semibold text-sm">{part.title}</h4>
                      </div>
                      <p className="text-indigo-200 text-sm leading-relaxed pl-10">{part.content}</p>
                    </div>
                  ))}
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
                <div key={card.id} className="bg-white/10 border border-white/20 rounded-2xl p-5">

                  {/* Header carte */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${difficultyColor[card.difficulty]}`}>
                        {card.difficulty}
                      </span>
                      {card.topic && (
                        <span className="text-xs text-indigo-400 bg-white/5 px-2 py-1 rounded-lg">
                          {card.topic}
                        </span>
                      )}
                      {card.is_due && (
                        <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
                          À revoir
                        </span>
                      )}
                    </div>
                    <span className="text-indigo-400 text-xs">
                      {flipped[card.id] ? 'Réponse' : 'Question'}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div
                    onClick={() => toggleFlip(card.id)}
                    className="cursor-pointer min-h-16 flex items-center"
                  >
                    <p className="text-white font-medium leading-relaxed">
                      {flipped[card.id] ? card.answer : card.question}
                    </p>
                  </div>

                  {/* Boutons révision espacée */}
                  {flipped[card.id] && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-indigo-400 text-xs mb-3">Comment tu t'en es sorti ?</p>
                      <div className="grid grid-cols-4 gap-2">
                        {qualityButtons.map((btn) => (
                          <button
                            key={btn.value}
                            onClick={(e) => {
                              e.stopPropagation()
                              reviewMutation.mutate({ flashcardId: card.id, quality: btn.value })
                              setFlipped((prev) => ({ ...prev, [card.id]: false }))
                            }}
                            className={`text-xs py-2 px-1 rounded-xl border transition font-medium ${btn.color}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prochaine révision */}
                  {card.review_count > 0 && !flipped[card.id] && (
                    <p className="text-indigo-500 text-xs mt-3">
                      Prochaine révision : {new Date(card.next_review_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab — Prof IA Chat */}
        {activeTab === 'professor' && (
          <div className="flex flex-col h-[500px]">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
              {chatHistory.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-5xl block mb-3">🎓</span>
                  <p className="text-white font-medium">Bonjour ! Je suis ton Prof IA</p>
                  <p className="text-indigo-300 text-sm mt-1">
                    Pose-moi n'importe quelle question sur ce cours
                  </p>
                  <div className="mt-4 space-y-2">
                    {[
                      'Explique-moi le concept principal',
                      'Quels sont les points importants ?',
                      'Donne-moi un exemple concret',
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setChatInput(suggestion)}
                        className="block w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 text-sm px-4 py-2.5 rounded-xl transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-white/10 border border-white/20 text-indigo-200 rounded-bl-sm'
                  }`}>
                    {msg.role === 'assistant' && (
                      <span className="text-xs text-indigo-400 block mb-1">🎓 Prof IA</span>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pose ta question au Prof IA..."
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-indigo-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 rounded-xl transition"
              >
                <Send size={18} />
              </button>
            </div>

          </div>
        )}

        {/* Tab — Points faibles */}
        {activeTab === 'weakpoints' && (
          <div className="space-y-4">
            {!weakPoints || (weakPoints.weak_points.length === 0 && weakPoints.strong_points.length === 0) ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-5xl mb-4 block">🎯</span>
                <p className="text-indigo-300">Pas encore assez de données</p>
                <p className="text-indigo-400 text-sm mt-1">Fais quelques quiz pour voir tes points faibles</p>
              </div>
            ) : (
              <>
                {weakPoints.weak_points.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target size={18} className="text-red-400" />
                      Points faibles à travailler
                    </h3>
                    <div className="space-y-3">
                      {weakPoints.weak_points.map((item, i) => (
                        <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium text-sm">{item.topic}</span>
                            <span className="text-red-400 font-bold">{item.score}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <p className="text-red-400 text-xs mt-1">{item.total} question(s) répondue(s)</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {weakPoints.strong_points.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target size={18} className="text-emerald-400" />
                      Points forts
                    </h3>
                    <div className="space-y-3">
                      {weakPoints.strong_points.map((item, i) => (
                        <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium text-sm">{item.topic}</span>
                            <span className="text-emerald-400 font-bold">{item.score}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}