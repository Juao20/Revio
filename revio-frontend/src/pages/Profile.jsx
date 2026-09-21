import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { getProfile } from '../api/auth'
import { LogOut, TrendingUp, Bug, FileText, Shield, Upload } from 'lucide-react'
import useAuthStore from '../stores/authStore'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (profile?.username || '?').slice(0, 2).toUpperCase()

  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold">Profil</h1>
        <p className="text-sm text-text-faint mt-0.5">Ton compte et tes préférences.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-24" />
      ) : (
        <Card className="p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/14 text-accent flex items-center justify-center text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-lg truncate">{profile?.username}</h2>
            <p className="text-sm text-text-faint truncate">{profile?.email}</p>
          </div>
        </Card>
      )}

      <Link to="/progress">
        <Card className="p-4 flex items-center gap-3 hover:border-white/20 transition-colors">
          <div className="w-9 h-9 rounded-[10px] bg-accent/14 flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-accent" />
          </div>
          <span className="text-sm font-semibold flex-1">Voir ma progression</span>
        </Card>
      </Link>

      <Card className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-surface-2 flex items-center justify-center shrink-0">
            <Upload size={16} className="text-text-soft" />
          </div>
          <span className="text-sm font-semibold">Uploads aujourd'hui</span>
        </div>
        <span className="text-sm text-text-faint">{profile?.daily_uploads_used ?? 0} / illimité</span>
      </Card>

      <div className="space-y-1">
        <Link
          to="/bug-report"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-soft hover:bg-surface-2 hover:text-text transition-colors"
        >
          <Bug size={16} />
          Signaler un bug
        </Link>
        <Link
          to="/terms"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-soft hover:bg-surface-2 hover:text-text transition-colors"
        >
          <FileText size={16} />
          Conditions d'utilisation
        </Link>
        <Link
          to="/privacy"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-soft hover:bg-surface-2 hover:text-text transition-colors"
        >
          <Shield size={16} />
          Confidentialité
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors text-left"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </div>
  )
}
