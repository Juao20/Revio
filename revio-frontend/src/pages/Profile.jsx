import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { getProfile } from '../api/auth'
import { getSessions } from '../api/study'
import useAuthStore from '../stores/authStore'
import { ArrowLeft, LogOut, Brain, Clock, Target } from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => getSessions().then((r) => r.data),
    retry: false,
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const totalScore = sessions.reduce((acc, s) => acc + s.score, 0)
  const totalQuestions = sessions.reduce((acc, s) => acc + s.total_questions, 0)
  const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0
  const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-indigo-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-white font-bold text-lg">Mon profil</span>
        </div>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition flex items-center gap-2 text-sm">
          <LogOut size={16} />
          Déconnexion
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Avatar + infos */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-violet-500/30 rounded-2xl flex items-center justify-center text-3xl">
            🎓
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl">{profile?.username}</h2>
            <p className="text-indigo-300 text-sm">{profile?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-white font-semibold mb-3">📊 Mes statistiques</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
              <Brain size={20} className="text-violet-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{sessions.length}</p>
              <p className="text-indigo-400 text-xs mt-1">Sessions</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
              <Target size={20} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{avgScore}%</p>
              <p className="text-indigo-400 text-xs mt-1">Score moyen</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
              <Clock size={20} className="text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.floor(totalTime / 60)}
              </p>
              <p className="text-indigo-400 text-xs mt-1">Minutes</p>
            </div>
          </div>
        </div>

        {/* Historique sessions */}
        {sessions.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">🕐 Historique des sessions</h3>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => {
                const pct = Math.round((session.score / session.total_questions) * 100)
                return (
                  <div
                    key={session.id}
                    className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {session.score}/{session.total_questions} bonnes réponses
                      </p>
                      <p className="text-indigo-400 text-xs mt-0.5">
                        {new Date(session.created_at).toLocaleDateString('fr-FR')} — {Math.floor(session.duration / 60)}min
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {pct}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Uploads */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">📤 Uploads aujourd'hui</h3>
          <span className="text-indigo-300 text-sm">
            {profile?.daily_uploads_used} / ∞ uploads
          </span>
        </div>

      </div>
    </div>
  )
}