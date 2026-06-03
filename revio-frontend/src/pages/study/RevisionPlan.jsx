import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getRevisionPlan, createRevisionPlan } from '../../api/study'
import { ArrowLeft, Calendar, Clock, Lightbulb } from 'lucide-react'

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
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to={`/courses/${id}`} className="text-indigo-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-white font-bold">Plan de révision</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Formulaire date examen */}
        {!plan && (
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center">
            <span className="text-5xl block mb-4">📅</span>
            <h2 className="text-xl font-bold text-white mb-2">Quand est ton examen ?</h2>
            <p className="text-indigo-300 text-sm mb-6">
              L'IA va créer un plan de révision personnalisé jusqu'à ta date d'examen
            </p>

            <input
              type="date"
              value={examDate}
              min={today}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />

            <button
              onClick={() => createMutation.mutate()}
              disabled={!examDate || createMutation.isPending}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl py-4 transition shadow-lg shadow-violet-500/30"
            >
              {createMutation.isPending ? '⏳ Génération en cours...' : '🚀 Générer mon plan'}
            </button>
          </div>
        )}

        {/* Plan généré */}
        {plan && (
          <div className="space-y-6">

            {/* Header */}
            <div className="bg-violet-500/20 border border-violet-500/30 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-violet-300 text-sm font-medium">Date d'examen</p>
                <p className="text-white font-bold text-lg">
                  {new Date(plan.exam_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Calendar size={32} className="text-violet-400" />
            </div>

            {/* Jours du plan */}
            <div>
              <h3 className="text-white font-semibold mb-4">
                📋 Plan sur {plan.plan.total_days} jours
              </h3>
              <div className="space-y-3">
                {plan.plan.daily_plan?.map((day, i) => (
                  <div
                    key={i}
                    className="bg-white/10 border border-white/20 rounded-2xl p-5"
                  >
                    {/* Header jour */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-500/30 rounded-lg flex items-center justify-center">
                          <span className="text-violet-300 text-sm font-bold">{day.day}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{day.focus}</p>
                          <p className="text-indigo-400 text-xs">{day.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-400">
                        <Clock size={14} />
                        <span className="text-xs">{day.duration_minutes} min</span>
                      </div>
                    </div>

                    {/* Tâches */}
                    <ul className="space-y-2">
                      {day.tasks?.map((task, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 shrink-0" />
                          <p className="text-indigo-200 text-sm leading-relaxed">{task}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Conseils */}
            {plan.plan.tips && plan.plan.tips.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
                <h3 className="text-yellow-300 font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb size={18} />
                  Conseils de révision
                </h3>
                <ul className="space-y-2">
                  {plan.plan.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <p className="text-yellow-200 text-sm leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Regénérer */}
            <button
              onClick={() => {
                setExamDate('')
                refetch()
              }}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-indigo-300 hover:text-white rounded-xl py-3 text-sm transition"
            >
              Changer la date d'examen
            </button>

          </div>
        )}

      </div>
    </div>
  )
}