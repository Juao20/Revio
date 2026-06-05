import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Crown, Zap } from 'lucide-react'
import { createCheckout } from '../api/auth'
import useAuthStore from '../stores/authStore'

const features = [
  'Uploads illimités par jour',
  'Photos illimitées (3 max par cours)',
  'Flashcards illimitées par cours',
  'Quiz illimités',
  'Le Prof IA — pose toutes tes questions',
  'Historique des scores et progression',
  'Plan de révision personnalisé',
  'Mode examen simulé',
  'Détection des points faibles',
  'Support prioritaire',
]

export default function Premium() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  const handleCheckout = async (plan) => {
    setLoading(plan)
    setError('')
    try {
      const res = await createCheckout(plan)
      window.location.href = res.data.checkout_url
    } catch (err) {
      setError('Erreur lors de la création du checkout. Réessaie.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to="/profile" className="text-indigo-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-white font-bold text-lg">Premium</span>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-2xl mb-4">
            <Crown size={32} className="text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Revio Premium</h1>
          <p className="text-indigo-300">Révise plus vite, mémorise plus longtemps</p>
        </div>

        {/* Déjà Premium */}
        {user?.is_premium ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8 text-center">
            <span className="text-5xl block mb-3">✨</span>
            <h2 className="text-xl font-bold text-white mb-2">Tu es déjà Premium !</h2>
            <p className="text-yellow-300 text-sm mb-4">
              Tu as accès à toutes les fonctionnalités Premium de Revio.
            </p>
            <Link
              to="/"
              className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl px-6 py-3 transition"
            >
              Retour au dashboard 🚀
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-6 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-8">

              {/* Plan mensuel */}
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold text-lg">Mensuel</h3>
                  <div className="text-right">
                    <span className="text-white font-bold text-2xl">$5.99</span>
                    <span className="text-indigo-400 text-sm">/mois</span>
                  </div>
                </div>
                <p className="text-indigo-400 text-sm mb-4">Résilie à tout moment</p>
                <button
                  onClick={() => handleCheckout('monthly')}
                  disabled={loading === 'monthly'}
                  className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 text-white font-semibold rounded-xl py-3 transition"
                >
                  {loading === 'monthly' ? 'Redirection...' : 'Choisir Mensuel'}
                </button>
              </div>

              {/* Plan annuel */}
              <div className="bg-gradient-to-br from-violet-600/40 to-indigo-600/40 border-2 border-violet-500/50 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                    ⭐ MEILLEURE OFFRE
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold text-lg">Annuel</h3>
                  <div className="text-right">
                    <span className="text-white font-bold text-2xl">$49</span>
                    <span className="text-indigo-400 text-sm">/an</span>
                  </div>
                </div>
                <p className="text-emerald-400 text-sm mb-4">
                  Économise 40% — soit $4.08/mois
                </p>
                <button
                  onClick={() => handleCheckout('yearly')}
                  disabled={loading === 'yearly'}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  {loading === 'yearly' ? 'Redirection...' : 'Choisir Annuel'}
                </button>
              </div>

            </div>
          </>
        )}

        {/* Features — toujours visible */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">
            {user?.is_premium ? '✅ Tes avantages actifs' : 'Tout ce qui est inclus :'}
          </h3>
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  user?.is_premium
                    ? 'bg-yellow-500/20'
                    : 'bg-emerald-500/20'
                }`}>
                  <Check size={12} className={user?.is_premium ? 'text-yellow-400' : 'text-emerald-400'} />
                </div>
                <span className="text-indigo-200 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {!user?.is_premium && (
          <p className="text-center text-indigo-400 text-xs">
            🔒 Paiement sécurisé via LemonSqueezy · Remboursement sous 7 jours
          </p>
        )}

      </div>
    </div>
  )
}