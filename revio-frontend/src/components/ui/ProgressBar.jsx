const TONES = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export default function ProgressBar({ value, tone = 'accent', className = '', trackClassName = '' }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full h-1.5 bg-surface-3 rounded-full overflow-hidden ${trackClassName}`}
    >
      <div
        className={`h-full rounded-full transition-all ${TONES[tone]} ${className}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
