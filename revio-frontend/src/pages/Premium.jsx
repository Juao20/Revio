import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Crown, Zap } from 'lucide-react'

const features = [
  'Uploads illimités par jour',
  'Flashcards illimitées par cours',
  'Quiz illimités',
  'Le Prof IA — pose toutes tes questions',
  'Historique des scores et progression',
  'Export PDF des flashcards',
  'Plan de révision personnalisé',
  'Support prioritaire',
]

export default function Premium() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to="/profile" className="text-indigo-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <span className="text-white font-bold text-lg">Passer en Premium</span>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-2xl mb-4">
            <Crown size={32} className="text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Revio Premium</h1>
          <p className="text-indigo-300">Révise plus vite, mémorise plus longtemps</p>
        </div>

        {/* Plans */}
        <div className="space-y-4 mb-8">

          {/* Plan mensuel */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-semibold text-lg">Mensuel</h3>
              <div className="text-right">
                <span className="text-white font-bold text-2xl">$6.99</span>
                <span className="text-indigo-400 text-sm">/mois</span>
              </div>
            </div>
            <p className="text-indigo-400 text-sm mb-4">Résilie à tout moment</p>
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl py-3 transition">
              Choisir Mensuel
            </button>
          </div>

          {/* Plan annuel — recommandé */}
          <div className="bg-gradient-to-br from-violet-600/40 to-indigo-600/40 border-2 border-violet-500/50 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                ⭐ MEILLEURE OFFRE
              </span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-semibold text-lg">Annuel</h3>
              <div className="text-right">
                <span className="text-white font-bold text-2xl">$49.99</span>
                <span className="text-indigo-400 text-sm">/an</span>
              </div>
            </div>
            <p className="text-emerald-400 text-sm mb-4">
              Économise 40% — soit $4.17/mois
            </p>
            <button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-3 transition shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2">
              <Zap size={18} />
              Choisir Annuel
            </button>
          </div>

        </div>

        {/* Features */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Tout ce qui est inclus :</h3>
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Check size={12} className="text-emerald-400" />
                </div>
                <span className="text-indigo-200 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Garantie */}
        <p className="text-center text-indigo-400 text-xs">
          🔒 Paiement sécurisé via LemonSqueezy · Remboursement sous 7 jours
        </p>

      </div>
    </div>
  )
}