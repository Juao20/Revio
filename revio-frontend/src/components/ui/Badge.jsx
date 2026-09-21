const TONES = {
  accent: 'bg-accent/14 text-accent',
  success: 'bg-success/14 text-success',
  warning: 'bg-warning/14 text-warning',
  danger: 'bg-danger/14 text-danger',
  info: 'bg-info/14 text-info',
  neutral: 'bg-surface-2 text-text-faint',
}

export default function Badge({ tone = 'neutral', icon: Icon, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  )
}
