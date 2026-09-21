import { useQuery } from '@tanstack/react-query'
import { Star, Flame, Brain, Target, Clock } from 'lucide-react'
import { getProfile } from '../api/auth'
import { getSessions, getHeatmap } from '../api/study'
import Card from '../components/ui/Card'
import StatTile from '../components/ui/StatTile'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'
import Alert from '../components/ui/Alert'
import Skeleton from '../components/ui/Skeleton'
import { getErrorMessage } from '../lib/errors'

const LEVEL_XP = { 1: 0, 2: 100, 3: 300, 4: 600 }

function buildWeeks(activities) {
  const byDate = Object.fromEntries(activities.map((a) => [a.date, a]))
  const days = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ key, activity: byDate[key] })
  }
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}

function intensity(activity) {
  if (!activity || activity.sessions_count === 0) return 'bg-surface-3'
  if (activity.sessions_count >= 4) return 'bg-accent'
  if (activity.sessions_count >= 2) return 'bg-accent/60'
  return 'bg-accent/25'
}

export default function Progress() {
  const { data: profile, isLoading: profileLoading, isError: profileError, error: pErr } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => getSessions().then((r) => r.data),
  })

  const { data: activities = [], isLoading: heatmapLoading } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => getHeatmap().then((r) => r.data),
  })

  const level = profile?.level
  const currentFloor = level ? LEVEL_XP[level.number] : 0
  const target = level?.next
  const xpInLevel = profile ? profile.xp - currentFloor : 0
  const levelSpan = target ? target - currentFloor : 1
  const pct = target ? Math.round((xpInLevel / levelSpan) * 100) : 100

  const totalScore = sessions.reduce((acc, s) => acc + s.score, 0)
  const totalQuestions = sessions.reduce((acc, s) => acc + s.total_questions, 0)
  const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0
  const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0)

  const weeks = buildWeeks(activities)

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold">Progression</h1>
        <p className="text-sm text-text-faint mt-0.5">Ton évolution sur l'ensemble de tes révisions.</p>
      </div>

      {profileError && <Alert tone="danger">{getErrorMessage(pErr, 'Impossible de charger ta progression.')}</Alert>}

      {profileLoading ? (
        <Skeleton className="h-32" />
      ) : (
        profile && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-accent" />
                <span className="font-bold">
                  Niveau {level.number} · {level.name}
                </span>
              </div>
              <span className="text-sm text-text-faint">
                {profile.xp} XP{target ? ` / ${target} XP` : ''}
              </span>
            </div>
            <ProgressBar value={pct} className="h-2.5" />
            {!target && <p className="text-xs text-text-faint mt-2">Niveau maximum atteint — bravo !</p>}
          </Card>
        )
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon={Flame} iconColor="text-warning" label="Streak actuel" value={profile?.current_streak ?? '—'} hint={`Record : ${profile?.longest_streak ?? 0} jours`} />
        <StatTile icon={Brain} label="Sessions" value={sessions.length} />
        <StatTile icon={Target} iconColor="text-success" label="Score moyen" value={`${avgScore}%`} />
        <StatTile icon={Clock} iconColor="text-info" label="Temps total" value={`${Math.floor(totalTime / 60)} min`} />
      </div>

      <div>
        <h2 className="text-sm font-bold mb-3">Activité — 12 dernières semaines</h2>
        <Card className="p-5">
          {heatmapLoading ? (
            <Skeleton className="h-24" />
          ) : (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1.5">
                  {week.map((day) => (
                    <div
                      key={day.key}
                      title={day.key}
                      className={`w-3.5 h-3.5 rounded-[3px] ${intensity(day.activity)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-bold mb-3">Historique des sessions</h2>
        {sessionsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="Aucune session pour l'instant"
            description="Fais un quiz ou un examen pour voir apparaître ton historique ici."
          />
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 8).map((session) => {
              const spct = Math.round((session.score / session.total_questions) * 100)
              return (
                <Card key={session.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {session.score}/{session.total_questions} bonnes réponses
                    </p>
                    <p className="text-xs text-text-faint mt-0.5">
                      {new Date(session.created_at).toLocaleDateString('fr-FR')} · {Math.floor(session.duration / 60)} min
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      spct >= 80 ? 'text-success' : spct >= 50 ? 'text-warning' : 'text-danger'
                    }`}
                  >
                    {spct}%
                  </span>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
