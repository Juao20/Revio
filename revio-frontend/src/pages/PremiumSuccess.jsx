import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

export default function PremiumSuccess() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Rafraîchir le profil pour récupérer is_premium = true
    queryClient.invalidateQueries(['profile'])
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white/10 border border-white/20 rounded-2xl p-8">
          <span className="text-6xl block mb-4">🎉</span>
          <h1 className="text-2xl font-bold text-white mb-2">Bienvenue dans Premium !</h1>
          <p className="text-indigo-300 mb-6">
            Ton compte a été mis à niveau avec succès. Toutes les fonctionnalités Premium sont maintenant disponibles.
          </p>

          <div className="bg-violet-500/20 border border-violet-500/30 rounded-xl p-4 mb-6 text-left space-y-2">
            {[
              '✅ Uploads illimités',
              '✅ Flashcards illimitées',
              '✅ Prof IA illimité',
              '✅ Détection des points faibles',
              '✅ Mode examen simulé',
              '✅ Historique complet',
            ].map((feature, i) => (
              <p key={i} className="text-violet-200 text-sm">{feature}</p>
            ))}
          </div>

          <Link
            to="/"
            className="block w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-3 transition"
          >
            Commencer à réviser 🚀
          </Link>
        </div>
      </div>
    </div>
  )
}