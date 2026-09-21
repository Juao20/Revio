import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Layers, Brain, GraduationCap, Trophy, Flame, ArrowLeft, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'

const SLIDES = [
  {
    icon: Sparkles,
    title: 'Bienvenue sur Revio',
    description: "Transforme n'importe quel cours en outils de révision personnalisés en quelques secondes grâce à l'IA.",
  },
  {
    icon: Layers,
    title: 'Flashcards intelligentes',
    description: "L'IA génère automatiquement des flashcards adaptées à ton cours avec un système de révision espacée pour mémoriser durablement.",
  },
  {
    icon: Brain,
    title: 'Quiz interactifs',
    description: "Teste tes connaissances avec des quiz générés par l'IA. Revio détecte tes points faibles et t'aide à les améliorer.",
  },
  {
    icon: GraduationCap,
    title: 'Le Prof IA',
    description: "Pose n'importe quelle question sur ton cours et le Prof IA te répond comme un vrai professeur, disponible 24h/24.",
  },
  {
    icon: Trophy,
    title: 'Mode Examen',
    description: 'Entraîne-toi dans des conditions réelles avec des examens simulés, un timer et une correction détaillée à la fin.',
  },
  {
    icon: Flame,
    title: 'Reste motivé',
    description: 'Suis ta progression avec ton streak quotidien, tes XP, ton niveau et une heatmap de révision. Chaque jour compte !',
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
  const Icon = slide.icon

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <div className="flex justify-end px-6 pt-6">
        <button onClick={handleFinish} className="text-text-faint hover:text-text text-sm font-medium transition-colors">
          Passer
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <div className="bg-surface border border-white/8 rounded-3xl p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/14 flex items-center justify-center mx-auto mb-6">
              <Icon size={30} className="text-accent" />
            </div>
            <h2 className="text-xl font-extrabold mb-3 leading-tight">{slide.title}</h2>
            <p className="text-text-soft text-sm leading-relaxed">{slide.description}</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Aller à l'étape ${i + 1}`}
                className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-accent' : 'w-2 h-2 bg-white/15 hover:bg-white/30'}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {current > 0 && (
              <Button variant="secondary" icon={ArrowLeft} onClick={() => setCurrent(current - 1)} className="flex-1">
                Retour
              </Button>
            )}
            <Button icon={ArrowRight} iconPosition="right" onClick={handleNext} className="flex-1">
              {current === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
