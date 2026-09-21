import { LayoutDashboard, BookOpen, TrendingUp, User } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/courses', label: 'Mes cours', icon: BookOpen },
  { to: '/progress', label: 'Progression', icon: TrendingUp },
  { to: '/profile', label: 'Profil', icon: User },
]
