import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, CheckCircle } from 'lucide-react'
import { createBugReport } from '../api/bugs'
import { getErrorMessage } from '../lib/errors'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input, { Field } from '../components/ui/Input'
import Alert from '../components/ui/Alert'

const SEVERITIES = [
  { value: 'low', label: 'Faible — bug mineur' },
  { value: 'medium', label: "Moyen — affecte l'expérience" },
  { value: 'high', label: 'Élevé — bloque une fonctionnalité' },
  { value: 'critical', label: "Critique — l'app ne fonctionne pas" },
]

export default function BugReport() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', page: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createBugReport(form)
      setSubmitted(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setError(getErrorMessage(err, "Impossible d'envoyer ton rapport. Réessaie."))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-lg mx-auto">
        <Card className="p-10 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-success/14 flex items-center justify-center">
            <CheckCircle size={26} className="text-success" />
          </div>
          <h2 className="font-bold text-lg">Merci pour ton signalement !</h2>
          <p className="text-text-faint text-sm">
            On examine ton rapport et on corrige ça au plus vite.
          </p>
          <p className="text-text-faint text-xs">Redirection vers l'accueil...</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Signaler un bug" backTo="/" />
      <div className="px-4 md:px-8 py-4 max-w-lg mx-auto space-y-5">
        <Alert tone="info">Aide-nous à améliorer Revio en signalant les bugs que tu rencontres.</Alert>

        {error && <Alert tone="danger">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Titre du bug *" htmlFor="title">
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex : les flashcards ne s'affichent pas"
              required
            />
          </Field>

          <Field label="Page concernée" htmlFor="page">
            <Input
              id="page"
              name="page"
              value={form.page}
              onChange={handleChange}
              placeholder="Ex : /courses/123/quiz"
            />
          </Field>

          <Field label="Sévérité" htmlFor="severity">
            <select
              id="severity"
              name="severity"
              value={form.severity}
              onChange={handleChange}
              className="w-full bg-surface-2 border border-white/15 rounded-xl px-4 py-3 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-colors"
            >
              {SEVERITIES.map((s) => (
                <option key={s.value} value={s.value} className="bg-surface">
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description *" htmlFor="description">
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décris le problème : comment l'as-tu rencontré, qu'as-tu fait avant ?"
              rows={6}
              required
              className="w-full bg-surface-2 border border-white/15 rounded-xl px-4 py-3 text-sm text-text placeholder-text-faint outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-colors resize-none"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/')} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" loading={loading} icon={Send} className="flex-1">
              Envoyer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
