import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../api/courses'
import { getProfile } from '../api/auth'
import useAuthStore from '../stores/authStore'
import { BookOpen, Plus, Clock, Zap, LogOut } from 'lucide-react'

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

  useEffect(() => {
    if (profile) setAuth(profile, localStorage.getItem('token'))
  }, [profile])

  const handleLogout = () => {
    logout()
    navigate('/login')
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
          <span className="text-indigo-300 text-sm">{profile?.username}</span>
          <button
            onClick={handleLogout}
            className="text-indigo-400 hover:text-white transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Bonjour, {profile?.username} 👋
          </h1>
          <p className="text-indigo-300 mt-1">Prêt à réviser aujourd'hui ?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-violet-500/30 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-violet-300" />
              </div>
              <span className="text-indigo-300 text-sm">Cours uploadés</span>
            </div>
            <p className="text-3xl font-bold text-white">{courses.length}</p>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-500/30 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-emerald-300" />
              </div>
              <span className="text-indigo-300 text-sm">Uploads aujourd'hui</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {profile?.daily_uploads_used}
              <span className="text-lg text-indigo-400">
                /{profile?.is_premium ? '∞' : '2'}
              </span>
            </p>
          </div>
        </div>

        {/* Bouton upload */}
        <Link
          to="/upload"
          className="flex items-center justify-center gap-3 w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-2xl py-4 mb-8 transition shadow-lg shadow-violet-500/30"
        >
          <Plus size={20} />
          Uploader un nouveau cours
        </Link>

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