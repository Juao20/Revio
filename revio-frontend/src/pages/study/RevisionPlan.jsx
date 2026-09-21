import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getRevisionPlan, createRevisionPlan } from '../../api/study'
import { Calendar, Clock, Lightbulb } from 'lucide-react'
import { getErrorMessage } from '../../lib/errors'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import Skeleton from '../../components/ui/Skeleton'

export default function RevisionPlan() {
  const { id } = useParams()
  const [examDate, setExamDate] = useState('')

  const { data: plan, isLoading, refetch } = useQuery({
    queryKey: ['revision-plan', id],
    queryFn: () => getRevisionPlan(id).then((r) => r.data),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: () => createRevisionPlan(id, examDate),
    onSuccess: () => refetch(),
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <PageHeader title="Plan de révision" backTo={`/courses/${id}`} />

      <div className="px-4 md:px-8 py-4 max-w-2xl mx-auto">
        {isLoading && <Skeleton className="h-56" />}

        {!isLoading && !plan && (
          <Card className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/14 flex items-center justify-center mx-auto mb-4">
              <Calendar size={26} className="text-accent" />
            </div>
            <h2 className="font-bold text-lg mb-1.5">Quand est ton examen ?</h2>
            <p className="text-text-faint text-sm mb-6">
              L'IA crée un plan de révision personnalisé jusqu'à ta date d'examen.
            </p>

            <Input type="date" value={examDate} min={today} onChange={(e) => setExamDate(e.target.value)} className="mb-4" />

            <Button
              onClick={() => createMutation.mutate()}
              disabled={!examDate}
              loading={createMutation.isPending}
              className="w-full"
              size="lg"
            >
              Générer mon plan
            </Button>

            {createMutation.isError && (
              <Alert tone="danger" className="mt-4 text-left">
                {getErrorMessage(createMutation.error, 'Impossible de générer ton plan. Réessaie.')}
              </Alert>
            )}
          </Card>
        )}

        {plan && (
          <div className="space-y-6">
            <Card className="p-5 flex items-center justify-between">
              <div>
                <p className="text-text-faint text-xs font-semibold">Date d'examen</p>
                <p className="font-bold">
                  {new Date(plan.exam_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Calendar size={28} className="text-accent" />
            </Card>

            <div>
              <h3 className="font-bold text-sm mb-3">Plan sur {plan.plan.total_days} jours</h3>
              <div className="space-y-3">
                {plan.plan.daily_plan?.map((day, i) => (
                  <Card key={i} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent/14 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-accent text-sm font-bold">{day.day}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{day.focus}</p>
                          <p className="text-text-faint text-xs">{day.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-text-faint shrink-0">
                        <Clock size={13} />
                        <span className="text-xs">{day.duration_minutes} min</span>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {day.tasks?.map((task, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 shrink-0" />
                          <p className="text-text-soft text-sm leading-relaxed">{task}</p>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>

            {plan.plan.tips?.length > 0 && (
              <Card className="p-5 border-warning/20">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                  <Lightbulb size={16} className="text-warning" />
                  Conseils de révision
                </h3>
                <ul className="space-y-2">
                  {plan.plan.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-warning mt-0.5">•</span>
                      <p className="text-text-soft text-sm leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Button
              variant="secondary"
              onClick={() => {
                setExamDate('')
                refetch()
              }}
              className="w-full"
            >
              Changer la date d'examen
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
