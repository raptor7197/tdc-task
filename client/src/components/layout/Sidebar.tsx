import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Sliders, Heart } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard', label: 'Customers', icon: Users },
  { to: '/scoring', label: 'Scoring Config', icon: Sliders },
]

export default function Sidebar() {
  return (
    <aside className="w-64 surface-high min-h-screen flex flex-col border-r border-white/5">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-coral-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-primary leading-tight">Nocturne</h1>
            <p className="text-xs text-on-surface-variant/60">Matchmaker Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-violet-500/10 text-primary border border-violet-500/20'
                  : 'text-on-surface-variant/70 hover:bg-white/5 hover:text-on-surface-variant border border-transparent',
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-on-surface-variant/40 text-center">Nocturne v1.0</p>
      </div>
    </aside>
  )
}
