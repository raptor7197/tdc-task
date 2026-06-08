import { useAuth } from '../../context/AuthContext'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 surface-default border-b border-white/5 flex items-center justify-between px-6">
      <div>
        <h2 className="font-display text-base text-on-surface/90">
          Welcome, <span className="text-primary">{user?.name}</span>
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant/60">
          <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center border border-violet-500/20">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="hidden sm:inline">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
