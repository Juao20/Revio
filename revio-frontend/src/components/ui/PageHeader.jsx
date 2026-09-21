import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, subtitle, onBack, backTo, actions, className = '' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) return onBack()
    if (backTo) return navigate(backTo)
    navigate(-1)
  }

  return (
    <div className={`flex items-center justify-between gap-4 px-4 md:px-8 pt-6 pb-2 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {(onBack || backTo) && (
          <button
            onClick={handleBack}
            aria-label="Retour"
            className="w-9 h-9 shrink-0 rounded-[10px] bg-surface-2 border border-white/10 flex items-center justify-center text-text-soft hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="min-w-0">
          {subtitle && <p className="text-xs font-semibold text-text-faint mb-0.5">{subtitle}</p>}
          <h1 className="text-xl font-extrabold truncate">{title}</h1>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
