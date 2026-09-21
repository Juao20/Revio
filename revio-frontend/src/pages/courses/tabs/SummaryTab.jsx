import { Clock, Sparkles } from 'lucide-react'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import EmptyState from '../../../components/ui/EmptyState'

export default function SummaryTab({ course }) {
  if (!course?.summary?.length) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Pas encore de résumé"
        description="Clique sur « Générer l'IA » pour créer le résumé, les flashcards et le quiz de ce cours."
      />
    )
  }

  return (
    <div className="space-y-4">
      {course.estimated_mastery_time && (
        <div className="flex items-center gap-3 bg-info/10 border border-info/20 rounded-xl px-5 py-3">
          <Clock size={16} className="text-info" />
          <p className="text-sm">
            Temps estimé pour maîtriser ce cours :{' '}
            <span className="font-semibold">{course.estimated_mastery_time}</span>
          </p>
        </div>
      )}

      {course.key_concepts?.length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-sm mb-3">Concepts clés</h3>
          <div className="flex flex-wrap gap-2">
            {course.key_concepts.map((concept) => (
              <Badge key={concept} tone="accent" className="text-xs">
                {concept}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="font-bold text-sm">Résumé du cours</h3>
        {course.summary.map((part, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-7 h-7 bg-accent/14 text-accent rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <h4 className="font-semibold text-sm">{part.title}</h4>
            </div>
            <p className="text-text-soft text-sm leading-relaxed pl-10">{part.content}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
