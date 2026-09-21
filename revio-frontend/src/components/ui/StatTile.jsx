import Card from './Card'

export default function StatTile({ icon: Icon, iconColor = 'text-accent', label, value, hint, className = '' }) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2.5">
        {Icon && <Icon size={15} className={iconColor} />}
        <span className="text-xs font-semibold text-text-faint">{label}</span>
      </div>
      <p className="text-xl font-extrabold">{value}</p>
      {hint && <p className="text-[11px] text-text-faint mt-1.5">{hint}</p>}
    </Card>
  )
}
