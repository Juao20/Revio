import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import useAuthStore from '../../stores/authStore'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(form)
      setAuth(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError('Identifiants incorrects')
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
          <h2 className="text-xl font-semibold text-white mb-6">Connexion</h2>

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
                className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                placeholder="ton_username"
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
                className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition shadow-lg shadow-violet-500/30"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-indigo-300 text-sm text-center mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}