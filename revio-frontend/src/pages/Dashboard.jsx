import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../api/courses'
import { getProfile } from '../api/auth'
import { getDueFlashcards, getHeatmap } from '../api/study'
import { BookOpen, Plus, Zap, Flame, Star, Brain, ArrowRight, Layers } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import StatTile from '../components/ui/StatTile'
import EmptyState from '../components/ui/EmptyState'
import Alert from '../components/ui/Alert'
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton'
import { getErrorMessage } from '../lib/errors'

const LEVEL_FLOOR = { 1: 0, 2: 100, 3: 300, 4: 600 }

function masteryTone(score) {
  if (score >= 85) return 'success'
  if (score >= 50) return 'accent'
  return 'warning'
}

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  const { data: courses = [], isLoading: coursesLoading, isError: coursesError, error: coursesErr } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses().then((r) => r.data),
  })

  const { data: dueData } = useQuery({
    queryKey: ['due-flashcards'],
    queryFn: () => getDueFlashcards().then((r) => r.data),
  })

  const { data: heatmap = [] } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => getHeatmap().then((r) => r.data),
  })

  const level = profile?.level
  const floor = level ? LEVEL_FLOOR[level.number] : 0
  const xpInLevel = profile ? profile.xp - floor : 0
  const span = level?.next ? level.next - floor : 1
  const xpPct = level?.next ? Math.round((xpInLevel / span) * 100) : 100

  const heatmapMap = Object.fromEntries(heatmap.map((a) => [a.date, a.sessions_count]))
  const today = new Date()
  const weeks = []
  for (let w = 9; w >= 0; w--) {
    const week = []
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today)
      date.setDate(today.getDate() - (w * 7 + d))
      const key = date.toISOString().split('T')[0]
      week.push({ date: key, count: heatmapMap[key] || 0 })
    }
    weeks.push(week)
  }

  const nextCourse = courses[0]
  const dueCount = dueData?.due_count || 0

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-7">
      <div>
        <h1 className="text-xl font-extrabold">
          {profileLoading ? 'Salut !' : `Salut ${profile?.username} 👋`}
        </h1>
        <p className="text-sm text-text-faint mt-0.5">
          {profile?.current_streak > 0
            ? `Tu as révisé ${profile.current_streak} jour${profile.current_streak > 1 ? 's' : ''} de suite. Continue comme ça.`
            : 'Prêt à réviser aujourd\'hui ?'}
        </p>
      </div>

      {coursesError && <Alert tone="danger">{getErrorMessage(coursesErr, 'Impossible de charger ton tableau de bord.')}</Alert>}

      {/* Next action */}
      {coursesLoading ? (
        <Skeleton className="h-28" />
      ) : nextCourse ? (
        <Card className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/14 flex items-center justify-center shrink-0">
              <Zap size={22} className="text-accent" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-accent uppercase tracking-wide mb-0.5">
                Continue ta révision
              </p>
              <h2 className="font-bold">{nextCourse.title}</h2>
              <p className="text-xs text-text-faint mt-0.5">
                {dueCount > 0 ? `${dueCount} flashcard${dueCount > 1 ? 's' : ''} à revoir` : `Maîtrise ${nextCourse.mastery_score}%`}
              </p>
            </div>
          </div>
          <Link to={`/courses/${nextCourse.id}`}>
            <Button icon={ArrowRight} iconPosition="right">Reprendre</Button>
          </Link>
        </Card>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Importe ton premier cours"
          description="Texte, PDF ou photo — Revio génère automatiquement résumé, flashcards et quiz."
          action={
            <Link to="/upload">
              <Button icon={Plus}>Importer un cours</Button>
            </Link>
          }
        />
      )}

      {/* Level progress */}
      {profile && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-accent" />
              <span className="text-sm font-bold">
                Niveau {level.number} · {level.name}
              </span>
            </div>
            <span className="text-xs text-text-faint">
              {profile.xp} XP{level.next ? ` / ${level.next} XP` : ''}
            </span>
          </div>
          <ProgressBar value={xpPct} />
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={Flame} iconColor="text-warning" label="Streak" value={`${profile?.current_streak ?? 0}j`} />
        <StatTile icon={BookOpen} label="Cours actifs" value={courses.length} />
        <StatTile icon={Brain} iconColor="text-success" label="À revoir" value={dueCount} hint="flashcards dues" />
        <StatTile icon={Layers} iconColor="text-info" label="Record streak" value={`${profile?.longest_streak ?? 0}j`} />
      </div>

      {/* Courses grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">Mes cours</h2>
          {courses.length > 0 && (
            <Link to="/courses" className="text-xs font-semibold text-accent hover:text-accent-hover">
              Tout voir
            </Link>
          )}
        </div>

        {coursesLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!coursesLoading && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.slice(0, 6).map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card className="p-4 h-full flex flex-col gap-3 hover:border-white/20 transition-colors">
                  <div className="w-9 h-9 rounded-[10px] bg-accent/14 flex items-center justify-center">
                    <BookOpen size={16} className="text-accent" />
                  </div>
                  <h3 className="text-sm font-bold truncate">{course.title}</h3>
                  <ProgressBar value={course.mastery_score} tone={masteryTone(course.mastery_score)} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Activity */}
      {heatmap.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3">Activité</h2>
          <Card className="p-5">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1.5">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date} — ${day.count} session(s)`}
                      className={`w-3.5 h-3.5 rounded-[3px] ${
                        day.count === 0 ? 'bg-surface-3' : day.count === 1 ? 'bg-accent/25' : day.count === 2 ? 'bg-accent/60' : 'bg-accent'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
