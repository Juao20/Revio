import { useState } from 'react'
import { Layers } from 'lucide-react'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import EmptyState from '../../../components/ui/EmptyState'

const DIFFICULTY_TONE = { easy: 'success', medium: 'warning', hard: 'danger' }

const QUALITY_BUTTONS = [
  { value: 0, label: 'Raté', tone: 'bg-danger/14 hover:bg-danger/25 text-danger' },
  { value: 3, label: 'Difficile', tone: 'bg-warning/14 hover:bg-warning/25 text-warning' },
  { value: 4, label: 'Bien', tone: 'bg-info/14 hover:bg-info/25 text-info' },
  { value: 5, label: 'Parfait', tone: 'bg-success/14 hover:bg-success/25 text-success' },
]

export default function FlashcardsTab({ flashcards, onReview }) {
  const [flipped, setFlipped] = useState({})

  const toggleFlip = (cardId) => setFlipped((prev) => ({ ...prev, [cardId]: !prev[cardId] }))

  if (flashcards.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="Aucune flashcard pour l'instant"
        description="Clique sur « Générer l'IA » pour en créer à partir de ce cours."
      />
    )
  }

  return (
    <div className="space-y-4">
      {flashcards.map((card) => (
        <Card key={card.id} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge tone={DIFFICULTY_TONE[card.difficulty] || 'neutral'}>{card.difficulty}</Badge>
              {card.topic && <Badge tone="neutral">{card.topic}</Badge>}
              {card.is_due && <Badge tone="warning">À revoir</Badge>}
            </div>
            <span className="text-text-faint text-xs font-semibold uppercase tracking-wide">
              {flipped[card.id] ? 'Réponse' : 'Question'}
            </span>
          </div>

          <div onClick={() => toggleFlip(card.id)} className="cursor-pointer min-h-16 flex items-center">
            <p className="font-medium leading-relaxed">{flipped[card.id] ? card.answer : card.question}</p>
          </div>

          {flipped[card.id] && (
            <div className="mt-4 pt-4 border-t border-white/8">
              <p className="text-text-faint text-xs mb-3">Comment tu t'en es sorti ?</p>
              <div className="grid grid-cols-4 gap-2">
                {QUALITY_BUTTONS.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={(e) => {
                      e.stopPropagation()
                      onReview(card.id, btn.value)
                      setFlipped((prev) => ({ ...prev, [card.id]: false }))
                    }}
                    className={`text-xs py-2 px-1 rounded-lg transition-colors font-semibold ${btn.tone}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {card.review_count > 0 && !flipped[card.id] && (
            <p className="text-text-faint text-xs mt-3">
              Prochaine révision : {new Date(card.next_review_date).toLocaleDateString('fr-FR')}
            </p>
          )}
        </Card>
      ))}
    </div>
  )
}
