import { NavLink, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { NAV_ITEMS } from './navItems'

const [dashboard, courses, , profile] = NAV_ITEMS
const progress = NAV_ITEMS[2]

export default function BottomNav() {
  const navigate = useNavigate()

  const renderItem = ({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-semibold transition-colors ${
          isActive ? 'text-accent' : 'text-text-faint'
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  )

  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden fixed bottom-0 inset-x-0 h-[74px] bg-surface border-t border-white/8 flex items-center justify-around pb-3 z-20"
    >
      {renderItem(dashboard)}
      {renderItem(courses)}
      <button
        onClick={() => navigate('/upload')}
        aria-label="Nouveau cours"
        className="w-[50px] h-[50px] rounded-full bg-accent flex items-center justify-center -mt-6 shadow-lg shadow-accent/40"
      >
        <Plus size={22} className="text-bg" strokeWidth={2.6} />
      </button>
      {renderItem(progress)}
      {renderItem(profile)}
    </nav>
  )
}
