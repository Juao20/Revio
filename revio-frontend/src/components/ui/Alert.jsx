import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const TONES = {
  danger: { wrap: 'bg-danger/12 border-danger/30 text-text', icon: AlertCircle, iconColor: 'text-danger' },
  success: { wrap: 'bg-success/12 border-success/30 text-text', icon: CheckCircle2, iconColor: 'text-success' },
  info: { wrap: 'bg-info/12 border-info/30 text-text', icon: Info, iconColor: 'text-info' },
}

export default function Alert({ tone = 'danger', children, className = '' }) {
  const { wrap, icon: Icon, iconColor } = TONES[tone]
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${wrap} ${className}`}>
      <Icon size={18} className={`shrink-0 mt-0.5 ${iconColor}`} />
      <span>{children}</span>
    </div>
  )
}
