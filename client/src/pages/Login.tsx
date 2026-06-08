import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Heart, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('priya@thedatecrew.com')
  const [password, setPassword] = useState('tdc2024')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back', { style: { background: '#1b1b1d', color: '#e5e1e4', border: '1px solid rgba(255,255,255,0.08)' } })
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials', { style: { background: '#1b1b1d', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Light leak background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-coral-500/10 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-coral-500 mb-5 shadow-xl shadow-violet-500/20">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary">Nocturne</h1>
          <p className="text-on-surface-variant/60 mt-1 text-sm">The Date Crew &mdash; Matchmaker Dashboard</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant/80 mb-1.5 tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pulse-input w-full px-0 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/30"
                placeholder="matchmaker@thedatecrew.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant/80 mb-1.5 tracking-wider uppercase">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pulse-input w-full px-0 py-2.5 pr-8 text-sm text-on-surface placeholder-on-surface-variant/30"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 rounded-xl text-sm font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3 justify-center mt-8">
          <div className="w-8 h-px bg-white/5" />
          <p className="text-xs text-on-surface-variant/30">
            Nocturne &copy; {new Date().getFullYear()}
          </p>
          <div className="w-8 h-px bg-white/5" />
        </div>
      </div>
    </div>
  )
}
