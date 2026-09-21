import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { register, googleLogin } from '../../api/auth'
import useAuthStore from '../../stores/authStore'
import { getErrorMessage } from '../../lib/errors'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleResponse = async (response) => {
    setLoading(true)
    setError('')
    try {
      const res = await googleLogin(response.credential)
      setAuth(res.data.user, res.data.token)
      navigate('/onboarding')
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
        window.google.accounts.id.renderButton(document.getElementById('google-signup-button'), {
          theme: 'filled_black',
          size: 'large',
          width: 340,
          text: 'signup_with',
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
    if (!accepted) {
      setError("Tu dois accepter les conditions d'utilisation pour continuer.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { username, email, password } = form
      const res = await register({ username, email, password })
      setAuth(res.data.user, res.data.token)
      navigate('/onboarding')
    } catch (err) {
      setError(getErrorMessage(err, 'Inscription impossible. Vérifie tes informations.'))
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
          <h2 className="font-bold text-lg mb-6">Créer un compte</h2>

          {error && <Alert tone="danger" className="mb-5">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-soft mb-1.5 block">Nom d'utilisateur</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="ton_username" required />
            </div>

            <div>
              <label className="text-sm font-medium text-text-soft mb-1.5 block">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="toi@email.com" required />
            </div>

            <div>
              <label className="text-sm font-medium text-text-soft mb-1.5 block">Mot de passe</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
            </div>

            <div>
              <label className="text-sm font-medium text-text-soft mb-1.5 block">Confirmer le mot de passe</label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="accept"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 accent-accent cursor-pointer shrink-0"
              />
              <label htmlFor="accept" className="text-text-soft text-sm cursor-pointer leading-relaxed">
                J'accepte les{' '}
                <Link to="/terms" className="text-accent hover:text-accent-hover underline" target="_blank">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-accent hover:text-accent-hover underline" target="_blank">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            <Button type="submit" disabled={!accepted} loading={loading} className="w-full" size="lg">
              Créer mon compte
            </Button>
          </form>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/8" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-text-faint">Ou s'inscrire avec</span>
                </div>
              </div>

              <div className="relative w-full flex justify-center">
                {!accepted && (
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={() => setError("Tu dois accepter les conditions d'utilisation pour continuer.")}
                  />
                )}
                <div id="google-signup-button" className={!accepted ? 'opacity-50' : ''} />
              </div>
            </>
          )}

          <p className="text-text-faint text-sm text-center mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-semibold">
              Se connecter
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
