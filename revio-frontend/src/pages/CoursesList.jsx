import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Plus } from 'lucide-react'
import { getCourses } from '../api/courses'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'
import Alert from '../components/ui/Alert'
import { SkeletonCard } from '../components/ui/Skeleton'
import { getErrorMessage } from '../lib/errors'

function masteryTone(score) {
  if (score >= 85) return 'success'
  if (score >= 50) return 'accent'
  return 'warning'
}

export default function CoursesList() {
  const [search, setSearch] = useState('')

  const { data: courses = [], isLoading, isError, error } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses().then((r) => r.data),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) => c.title.toLowerCase().includes(q))
  }, [courses, search])

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold">Mes cours</h1>
          <p className="text-sm text-text-faint mt-0.5">
            {courses.length} cours importé{courses.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/upload">
          <Button icon={Plus}>Nouveau cours</Button>
        </Link>
      </div>

      {courses.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cours..."
            className="pl-10"
            aria-label="Rechercher un cours"
          />
        </div>
      )}

      {isError && <Alert tone="danger">{getErrorMessage(error, 'Impossible de charger tes cours.')}</Alert>}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && courses.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Aucun cours pour l'instant"
          description="Importe ton premier cours — texte, PDF ou photo — et Revio générera automatiquement flashcards, quiz et résumé."
          action={
            <Link to="/upload">
              <Button icon={Plus}>Importer un cours</Button>
            </Link>
          }
        />
      )}

      {!isLoading && !isError && courses.length > 0 && filtered.length === 0 && (
        <EmptyState icon={Search} title="Aucun résultat" description={`Aucun cours ne correspond à "${search}".`} />
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`}>
              <Card className="p-5 h-full flex flex-col gap-4 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-[11px] bg-accent/14 flex items-center justify-center">
                    <BookOpen size={18} className="text-accent" />
                  </div>
                  {course.mastery_score > 0 && (
                    <Badge tone={masteryTone(course.mastery_score)}>{course.mastery_label}</Badge>
                  )}
                </div>
                <div>
                  <h3 className="font-bold truncate">{course.title}</h3>
                  <p className="text-xs text-text-faint mt-0.5">
                    {course.course_type || 'Cours'} · {new Date(course.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-text-soft mb-1.5">
                    <span>Maîtrise</span>
                    <span className="font-bold text-text">{course.mastery_score}%</span>
                  </div>
                  <ProgressBar value={course.mastery_score} tone={masteryTone(course.mastery_score)} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
