import { NavLink, useNavigate } from 'react-router-dom'
import { Plus, Bug, LogOut, GraduationCap } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import useAuthStore from '../../stores/authStore'

export default function Sidebar() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-white/8 flex-col p-4 gap-7">
      <NavLink to="/" className="flex items-center gap-2.5 px-2">
        <div className="w-8 h-8 rounded-[10px] bg-accent flex items-center justify-center shrink-0">
          <GraduationCap size={18} className="text-bg" strokeWidth={2.2} />
        </div>
        <span className="text-lg font-extrabold">Revio</span>
      </NavLink>

      <nav className="flex flex-col gap-1" aria-label="Navigation principale">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive ? 'bg-accent/14 text-accent' : 'text-text-soft hover:bg-surface-2 hover:text-text'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center justify-center gap-2 bg-accent text-bg rounded-xl py-3 text-sm font-bold hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          Nouveau cours
        </button>

        <div className="flex flex-col gap-1 pt-2 border-t border-white/8">
          <button
            onClick={() => navigate('/bug-report')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-text-faint hover:text-text-soft hover:bg-surface-2 transition-colors text-left"
          >
            <Bug size={14} />
            Signaler un bug
          </button>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-text-faint hover:text-danger hover:bg-danger/10 transition-colors text-left"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  )
}
