import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import useAuthStore from '../../stores/authStore'

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accepted) {
      setError('Tu dois accepter les conditions d\'utilisation pour continuer.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await register(form)
      setAuth(res.data.user, res.data.token)
      navigate('/onboarding')
    } catch (err) {
      setError('Erreur lors de l\'inscription. Vérifie tes informations.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500 rounded-2xl mb-4 shadow-lg shadow-violet-500/30">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Revio</h1>
          <p className="text-indigo-300 mt-1">Ton coach de révision IA</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Créer un compte</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-indigo-200 text-sm font-medium mb-1 block">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                placeholder="ton_username"
                required
              />
            </div>

            <div>
              <label className="text-indigo-200 text-sm font-medium mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                placeholder="toi@email.com"
                required
              />
            </div>

            <div>
              <label className="text-indigo-200 text-sm font-medium mb-1 block">
                Mot de passe
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Checkbox acceptation */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="accept"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 accent-violet-500 cursor-pointer shrink-0"
              />
              <label htmlFor="accept" className="text-indigo-300 text-sm cursor-pointer leading-relaxed">
                J'accepte les{' '}
                <Link
                  to="/terms"
                  className="text-violet-400 hover:text-violet-300 underline"
                  target="_blank"
                >
                  conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link
                  to="/privacy"
                  className="text-violet-400 hover:text-violet-300 underline"
                  target="_blank"
                >
                  politique de confidentialité
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !accepted}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition shadow-lg shadow-violet-500/30"
            >
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-indigo-300 text-sm text-center mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}