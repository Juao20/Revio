import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react'
import useAuthStore from '../stores/authStore'
import { createBugReport } from '../api/bugs'

export default function BugReport() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    page: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createBugReport({
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        page: formData.page,
      })

      setSubmitted(true)
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du bug report:', error)
      alert('Erreur lors de l\'envoi du rapport. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-indigo-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-white font-bold text-lg">Signaler un bug</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Message de succès */}
        {submitted ? (
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Merci pour votre signalement!</h2>
            <p className="text-indigo-300 mb-4">
              Nous examinons votre rapport et ferons de notre mieux pour corriger ce problème rapidement.
            </p>
            <p className="text-sm text-indigo-400">Redirection vers l'accueil...</p>
          </div>
        ) : (
          <>
            {/* Informations */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4 mb-6 flex gap-3">
              <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-200 text-sm">
                Aidez-nous à améliorer Revio en nous signalant les bugs que vous rencontrez.
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Titre */}
              <div>
                <label className="block text-white font-medium text-sm mb-2">
                  Titre du bug *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Les flashcards ne s'affichent pas"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-400/50 focus:outline-none focus:border-indigo-400 transition"
                  required
                />
              </div>

              {/* Page affectée */}
              <div>
                <label className="block text-white font-medium text-sm mb-2">
                  Page affectée
                </label>
                <input
                  type="text"
                  name="page"
                  value={formData.page}
                  onChange={handleChange}
                  placeholder="Ex: /courses/123/quiz"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-400/50 focus:outline-none focus:border-indigo-400 transition"
                />
              </div>

              {/* Sévérité */}
              <div>
                <label className="block text-white font-medium text-sm mb-2">
                  Sévérité
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-400 transition"
                >
                  <option value="low" className="bg-slate-800">Faible - Bug mineur</option>
                  <option value="medium" className="bg-slate-800">Moyen - Affecte l'expérience</option>
                  <option value="high" className="bg-slate-800">Élevé - Bloque une fonctionnalité</option>
                  <option value="critical" className="bg-slate-800">Critique - L'app ne fonctionne pas</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-medium text-sm mb-2">
                  Description du bug *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez le problème en détail. Comment l'avez-vous rencontré? Qu'avez-vous fait avant que cela se produise?"
                  rows={6}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-400/50 focus:outline-none focus:border-indigo-400 transition resize-none"
                  required
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium hover:from-violet-600 hover:to-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {loading ? 'Envoi en cours...' : 'Envoyer le rapport'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
