import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  {
    emoji: '🎓',
    title: 'Bienvenue sur Revio',
    description: 'Transforme n\'importe quel cours en outils de révision personnalisés en quelques secondes grâce à l\'IA.',
    color: 'from-violet-600/30 to-indigo-600/30',
  },
  {
    emoji: '🃏',
    title: 'Flashcards intelligentes',
    description: 'L\'IA génère automatiquement des flashcards adaptées à ton cours avec un système de révision espacée pour mémoriser durablement.',
    color: 'from-blue-600/30 to-violet-600/30',
  },
  {
    emoji: '🧠',
    title: 'Quiz interactifs',
    description: 'Teste tes connaissances avec des quiz générés par l\'IA. Revio détecte tes points faibles et t\'aide à les améliorer.',
    color: 'from-indigo-600/30 to-blue-600/30',
  },
  {
    emoji: '🎓',
    title: 'Le Prof IA',
    description: 'Pose n\'importe quelle question sur ton cours et le Prof IA te répond comme un vrai professeur, disponible 24h/24.',
    color: 'from-emerald-600/30 to-indigo-600/30',
  },
  {
    emoji: '🏆',
    title: 'Mode Examen',
    description: 'Entraîne-toi dans des conditions réelles avec des examens simulés, un timer et une correction détaillée à la fin.',
    color: 'from-yellow-600/30 to-orange-600/30',
  },
  {
    emoji: '🔥',
    title: 'Reste motivé',
    description: 'Suis ta progression avec ton streak quotidien, tes XP, ton niveau et une heatmap de révision. Chaque jour compte !',
    color: 'from-orange-600/30 to-red-600/30',
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = () => {
    localStorage.setItem('revio_onboarding_done', 'true')
    navigate('/')
  }

  const slide = SLIDES[current]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex flex-col">

      {/* Bouton passer */}
      <div className="flex justify-end px-6 pt-6">
        <button
          onClick={handleFinish}
          className="text-indigo-400 hover:text-white text-sm transition"
        >
          Passer →
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">

          {/* Carte slide */}
          <div className={`bg-gradient-to-br ${slide.color} border border-white/10 rounded-3xl p-8 text-center mb-8`}>
            <span className="text-7xl block mb-6">{slide.emoji}</span>
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
              {slide.title}
            </h2>
            <p className="text-indigo-200 leading-relaxed">
              {slide.description}
            </p>
          </div>

          {/* Indicateurs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current
                    ? 'w-6 h-2 bg-violet-400'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Boutons navigation */}
          <div className="flex gap-3">
            {current > 0 && (
              <button
                onClick={() => setCurrent(current - 1)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl py-3 font-medium transition"
              >
                ← Retour
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-3 transition shadow-lg shadow-violet-500/30"
            >
              {current === SLIDES.length - 1 ? 'Commencer 🚀' : 'Suivant →'}
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}