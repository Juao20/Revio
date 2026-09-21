import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Flame, GraduationCap } from 'lucide-react'
import { getProfile } from '../../api/auth'
import NotificationBell from '../NotificationBell'

export default function Topbar() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  const initials = (profile?.username || '?').slice(0, 2).toUpperCase()

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-8 border-b border-white/8">
      <Link to="/" className="md:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-[8px] bg-accent flex items-center justify-center">
          <GraduationCap size={15} className="text-bg" strokeWidth={2.2} />
        </div>
        <span className="font-extrabold">Revio</span>
      </Link>
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        {profile?.current_streak > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-warning/14 text-warning px-3 py-1.5 rounded-full text-xs font-bold">
            <Flame size={13} />
            {profile.current_streak}
          </div>
        )}
        <NotificationBell />
        <Link
          to="/profile"
          aria-label="Mon profil"
          className="w-9 h-9 rounded-full bg-accent/14 text-accent flex items-center justify-center text-xs font-bold"
        >
          {initials}
        </Link>
      </div>
    </header>
  )
}
