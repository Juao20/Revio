export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center text-center gap-3 py-16 px-6 bg-surface/50 border border-dashed border-white/10 rounded-2xl ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-accent/14 flex items-center justify-center">
          <Icon size={26} className="text-accent" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-text font-semibold">{title}</p>
        {description && <p className="text-text-faint text-sm max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  )
}
