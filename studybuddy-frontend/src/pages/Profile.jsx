import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { getProfile } from '../api/auth'
import { getSessions } from '../api/study'
import useAuthStore from '../stores/authStore'
import { ArrowLeft, LogOut, Crown, Brain, Clock, Target } from 'lucide-react'

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
    enabled: profile?.is_premium,
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
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-xl">{profile?.username}</h2>
              {profile?.is_premium && (
                <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown size={10} />
                  Premium
                </span>
              )}
            </div>
            <p className="text-indigo-300 text-sm">{profile?.email}</p>
          </div>
        </div>

        {/* Stats — Premium uniquement */}
        {profile?.is_premium ? (
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
        ) : (
          /* Bannière upgrade */
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Crown size={24} className="text-yellow-400" />
              <h3 className="text-white font-bold">Passe en Premium</h3>
            </div>
            <p className="text-yellow-200 text-sm mb-4">
              Débloque les flashcards illimitées, le Prof IA, l'historique de tes scores et bien plus !
            </p>
            <Link
              to="/premium"
              className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl px-6 py-3 text-sm transition"
            >
              Voir les offres ✨
            </Link>
          </div>
        )}

        {/* Historique sessions — Premium */}
        {profile?.is_premium && sessions.length > 0 && (
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

        {/* Limite uploads */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">📤 Uploads aujourd'hui</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-300 text-sm">
              {profile?.daily_uploads_used} / {profile?.is_premium ? '∞' : '2'} uploads
            </span>
            {!profile?.is_premium && (
              <span className="text-indigo-400 text-xs">Renouvellement à minuit</span>
            )}
          </div>
          {!profile?.is_premium && (
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-violet-500 h-2 rounded-full transition-all"
                style={{ width: `${((profile?.daily_uploads_used || 0) / 2) * 100}%` }}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}