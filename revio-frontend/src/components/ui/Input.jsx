export function Field({ label, error, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-text-soft">
          {label}
        </label>
      )}
      {children}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}

export default function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`w-full bg-surface-2 border rounded-xl px-4 py-3 text-sm text-text placeholder-text-faint outline-none transition-colors ${
        error
          ? 'border-danger'
          : 'border-white/15 focus:border-accent focus:ring-2 focus:ring-accent/25'
      } ${className}`}
      {...props}
    />
  )
}
