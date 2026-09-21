import { Target } from 'lucide-react'
import Card from '../../../components/ui/Card'
import ProgressBar from '../../../components/ui/ProgressBar'
import EmptyState from '../../../components/ui/EmptyState'

export default function WeakPointsTab({ weakPoints }) {
  const hasData = weakPoints && (weakPoints.weak_points.length > 0 || weakPoints.strong_points.length > 0)

  if (!hasData) {
    return (
      <EmptyState
        icon={Target}
        title="Pas encore assez de données"
        description="Fais quelques quiz sur ce cours pour voir apparaître tes points faibles et tes points forts par thème."
      />
    )
  }

  return (
    <div className="space-y-5">
      {weakPoints.weak_points.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Target size={16} className="text-danger" />
            À travailler
          </h3>
          <div className="space-y-3">
            {weakPoints.weak_points.map((item) => (
              <Card key={item.topic} className="p-4 border-danger/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.topic}</span>
                  <span className="font-bold text-danger">{item.score}%</span>
                </div>
                <ProgressBar value={item.score} tone="danger" />
                <p className="text-text-faint text-xs mt-1.5">{item.total} question(s) répondue(s)</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {weakPoints.strong_points.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Target size={16} className="text-success" />
            Points forts
          </h3>
          <div className="space-y-3">
            {weakPoints.strong_points.map((item) => (
              <Card key={item.topic} className="p-4 border-success/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.topic}</span>
                  <span className="font-bold text-success">{item.score}%</span>
                </div>
                <ProgressBar value={item.score} tone="success" />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
