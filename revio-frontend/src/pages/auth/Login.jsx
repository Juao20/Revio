import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { login, googleLogin } from '../../api/auth'
import useAuthStore from '../../stores/authStore'
import { getErrorMessage } from '../../lib/errors'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleResponse = async (response) => {
    setLoading(true)
    setError('')
    try {
      const res = await googleLogin(response.credential)
      setAuth(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Échec de la connexion avec Google.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleResponse })
        window.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
          theme: 'filled_black',
          size: 'large',
          width: 340,
          text: 'signin_with',
        })
        return true
      }
      return false
    }

    if (!initializeGoogle()) {
      const interval = setInterval(() => {
        if (initializeGoogle()) clearInterval(interval)
      }, 500)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(form)
      setAuth(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Identifiants incorrects.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-2xl mb-4">
            <GraduationCap size={26} className="text-bg" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-extrabold">Revio</h1>
          <p className="text-text-faint text-sm mt-1">Ton coach de révision IA</p>
        </div>

        <Card className="p-8">
          <h2 className="font-bold text-lg mb-6">Connexion</h2>

          {error && <Alert tone="danger" className="mb-5">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-soft mb-1.5 block">Nom d'utilisateur</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="ton_username" required />
            </div>

            <div>
              <label className="text-sm font-medium text-text-soft mb-1.5 block">Mot de passe</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Se connecter
            </Button>
          </form>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/8" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-text-faint">Ou se connecter avec</span>
                </div>
              </div>

              <div id="google-signin-button" className="flex justify-center" />
            </>
          )}

          <p className="text-text-faint text-sm text-center mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-semibold">
              S'inscrire
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
