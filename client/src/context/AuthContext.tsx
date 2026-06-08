import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../lib/types'

const MATCHMAKERS = [
  {
    id: 'mm_001',
    email: 'priya@thedatecrew.com',
    password: 'tdc2024',
    name: 'Priya Sharma',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Priya',
    assignedProfileIds: Array.from({ length: 60 }, (_, i) => `profile_${String(i + 1).padStart(4, '0')}`),
  },
  {
    id: 'mm_002',
    email: 'rahul@thedatecrew.com',
    password: 'tdc2024',
    name: 'Rahul Verma',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Rahul',
    assignedProfileIds: Array.from({ length: 60 }, (_, i) => `profile_${String(i + 61).padStart(4, '0')}`),
  },
]

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('tdc_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const matchmaker = MATCHMAKERS.find((m) => m.email === email && m.password === password)
    if (!matchmaker) {
      throw new Error('Invalid email or password')
    }
    const userData: User = {
      id: matchmaker.id,
      email: matchmaker.email,
      name: matchmaker.name,
      avatar: matchmaker.avatar,
      assignedProfileIds: matchmaker.assignedProfileIds,
    }
    localStorage.setItem('tdc_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('tdc_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
