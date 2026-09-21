import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

// Suite d'étapes qui avance automatiquement pendant que le composant est monté —
// on n'a pas de progression réelle depuis le backend (une seule requête), donc on
// rassure l'utilisateur avec des étapes crédibles plutôt qu'un spinner nu.
// Le parent ne doit monter ce composant que pendant l'opération en cours.
export default function AIProgress({ steps, stepDuration = 1400 }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => Math.min(c + 1, steps.length - 1))
    }, stepDuration)
    return () => clearInterval(interval)
  }, [steps.length, stepDuration])

  return (
    <div className="flex flex-col gap-3">
      {steps.map((label, i) => {
        const done = i < current
        const inProgress = i === current
        return (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                done ? 'bg-success/14 text-success' : inProgress ? 'bg-accent/14 text-accent' : 'bg-surface-2 text-text-faint'
              }`}
            >
              {done ? <Check size={14} /> : inProgress ? <Loader2 size={13} className="animate-spin" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
            </div>
            <span className={`text-sm ${done || inProgress ? 'text-text font-medium' : 'text-text-faint'}`}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
