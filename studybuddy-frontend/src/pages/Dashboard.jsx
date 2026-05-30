import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../api/courses'
import { getProfile } from '../api/auth'
import { getDueFlashcards, getHeatmap } from '../api/study'
import useAuthStore from '../stores/authStore'
import { BookOpen, Plus, Clock, Zap, LogOut, Flame, Star, Brain, User } from 'lucide-react'

const LEVEL_COLORS = {
  1: 'from-slate-400 to-slate-500',
  2: 'from-blue-400 to-blue-600',
  3: 'from-violet-400 to-violet-600',
  4: 'from-yellow-400 to-orange-500',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { logout, setAuth } = useAuthStore()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  const { data: courses = [], isLoading } = useQuery({
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

  useEffect(() => {
    if (profile) setAuth(profile, localStorage.getItem('token'))
  }, [profile])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const level = profile?.level
  const xpProgress = level?.next
    ? Math.round(((profile?.xp % (level.next - (level.number === 1 ? 0 : [0,100,300,600][level.number - 1]))) / (level.next - (level.number === 1 ? 0 : [0,100,300,600][level.number - 1]))) * 100)
    : 100

  // Heatmap — 12 dernières semaines
  const heatmapMap = {}
  heatmap.forEach((a) => { heatmapMap[a.date] = a.sessions_count })

  const today = new Date()
  const weeks = []
  for (let w = 11; w >= 0; w--) {
    const week = []
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today)
      date.setDate(today.getDate() - (w * 7 + d))
      const key = date.toISOString().split('T')[0]
      week.push({ date: key, count: heatmapMap[key] || 0 })
    }
    weeks.push(week)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-white font-bold text-xl">StudyBuddy</span>
        </div>
        <div className="flex items-center gap-4">
          {profile?.is_premium && (
            <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-semibold px-3 py-1 rounded-full">
              ✨ Premium
            </span>
          )}
          <Link to="/profile" className="text-indigo-300 hover:text-white transition">
            <User size={20} />
          </Link>
          <button onClick={handleLogout} className="text-indigo-400 hover:text-white transition">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header + Niveau */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Bonjour, {profile?.username} 👋
            </h1>
            <p className="text-indigo-300 mt-1">Prêt à réviser aujourd'hui ?</p>
          </div>
          {level && (
            <div className="text-right">
              <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${LEVEL_COLORS[level.number]} text-white`}>
                Niv.{level.number} — {level.name}
              </span>
              <p className="text-indigo-400 text-xs mt-1">{profile?.xp} XP</p>
            </div>
          )}
        </div>

        {/* XP Progress bar */}
        {level?.next && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-indigo-400 mb-1">
              <span>Progression vers niveau {level.number + 1}</span>
              <span>{xpProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-400" />
              <span className="text-indigo-300 text-xs">Streak</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {profile?.current_streak}
              <span className="text-sm text-indigo-400 ml-1">jours</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-yellow-400" />
              <span className="text-indigo-300 text-xs">XP Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{profile?.xp}</p>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-violet-400" />
              <span className="text-indigo-300 text-xs">Cours</span>
            </div>
            <p className="text-2xl font-bold text-white">{courses.length}</p>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-emerald-400" />
              <span className="text-indigo-300 text-xs">À revoir</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {dueData?.due_count || 0}
              <span className="text-sm text-indigo-400 ml-1">cartes</span>
            </p>
          </div>
        </div>

        {/* Alerte cartes à revoir */}
        {dueData?.due_count > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🃏</span>
              <div>
                <p className="text-orange-300 font-medium text-sm">
                  {dueData.due_count} flashcard{dueData.due_count > 1 ? 's' : ''} à revoir aujourd'hui
                </p>
                <p className="text-orange-400 text-xs">Ne casse pas ta série !</p>
              </div>
            </div>
            <Link
              to="/"
              className="bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              Réviser
            </Link>
          </div>
        )}

        {/* Bouton upload */}
        <Link
          to="/upload"
          className="flex items-center justify-center gap-3 w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-2xl py-4 mb-8 transition shadow-lg shadow-violet-500/30"
        >
          <Plus size={20} />
          Uploader un nouveau cours
        </Link>

        {/* Heatmap */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap size={16} className="text-violet-400" />
            Activité de révision
          </h3>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.date} — ${day.count} session(s)`}
                    className={`w-3 h-3 rounded-sm ${
                      day.count === 0
                        ? 'bg-white/10'
                        : day.count === 1
                        ? 'bg-violet-700'
                        : day.count === 2
                        ? 'bg-violet-500'
                        : 'bg-violet-400'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-indigo-400 text-xs">Moins</span>
            <div className="w-3 h-3 rounded-sm bg-white/10" />
            <div className="w-3 h-3 rounded-sm bg-violet-700" />
            <div className="w-3 h-3 rounded-sm bg-violet-500" />
            <div className="w-3 h-3 rounded-sm bg-violet-400" />
            <span className="text-indigo-400 text-xs">Plus</span>
          </div>
        </div>

        {/* Liste des cours */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Mes cours</h2>

          {isLoading && (
            <div className="text-center text-indigo-300 py-12">Chargement...</div>
          )}

          {!isLoading && courses.length === 0 && (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-5xl mb-4 block">📚</span>
              <p className="text-indigo-300">Aucun cours pour l'instant</p>
              <p className="text-indigo-400 text-sm mt-1">Upload ton premier cours pour commencer !</p>
            </div>
          )}

          <div className="space-y-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="flex items-center justify-between bg-white/10 hover:bg-white/15 backdrop-blur border border-white/20 rounded-2xl p-5 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-violet-500/30 rounded-xl flex items-center justify-center">
                    <BookOpen size={20} className="text-violet-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{course.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={12} className="text-indigo-400" />
                      <p className="text-indigo-400 text-xs">
                        {new Date(course.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-indigo-400 group-hover:text-white transition text-xl">→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}