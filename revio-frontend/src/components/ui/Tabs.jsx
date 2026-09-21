export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={`inline-flex gap-1 bg-surface border border-white/8 rounded-xl p-1 ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            active === tab.key
              ? 'bg-accent text-bg'
              : 'text-text-soft hover:text-text'
          }`}
        >
          {tab.icon && <tab.icon size={14} />}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
