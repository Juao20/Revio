export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-surface-2 rounded-xl ${className}`} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-surface border border-white/8 rounded-2xl p-5 space-y-3 ${className}`}>
      <Skeleton className="h-9 w-9 rounded-lg" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-1.5 w-full" />
    </div>
  )
}
