import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-accent text-bg hover:bg-accent-hover disabled:bg-surface-2 disabled:text-text-faint',
  secondary: 'bg-surface-2 text-text border border-white/15 hover:bg-surface-3 disabled:opacity-50',
  ghost: 'bg-transparent text-text-soft hover:bg-surface-2 hover:text-text disabled:opacity-50',
  danger: 'bg-danger/15 text-danger hover:bg-danger/25 disabled:opacity-50',
}

const SIZES = {
  sm: 'text-xs px-3 py-2 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-sm px-6 py-3.5 gap-2 rounded-xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold font-sans transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  )
}
