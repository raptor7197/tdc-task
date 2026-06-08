import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Heart, MessageCircle, Filter, ChevronDown } from 'lucide-react'
import { api } from '../lib/api'
import { cn, getStatusColor, getInitials } from '../lib/utils'
import type { Profile } from '../lib/types'

export default function Dashboard() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [genderFilter, setGenderFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    api.getAssignedProfiles()
      .then(setProfiles)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = [...profiles]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q),
      )
    }
    if (statusFilter) result = result.filter((p) => p.status === statusFilter)
    if (genderFilter) result = result.filter((p) => p.gender === genderFilter)
    return result
  }, [profiles, search, statusFilter, genderFilter])

  const stats = useMemo(() => ({
    total: profiles.length,
    active: profiles.filter((p) => !['finalized', 'on_hold'].includes(p.status)).length,
    inConversation: profiles.filter((p) => p.status === 'in_conversation').length,
    finalized: profiles.filter((p) => p.status === 'finalized').length,
  }), [profiles])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 surface-default rounded-xl border border-white/5" />
        <div className="h-64 surface-default rounded-xl border border-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: stats.total, icon: Users, color: 'from-violet-500/20 to-violet-500/5', iconBg: 'bg-violet-500/10', iconColor: 'text-primary' },
          { label: 'Active', value: stats.active, icon: Heart, color: 'from-emerald-500/20 to-emerald-500/5', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
          { label: 'In Conversation', value: stats.inConversation, icon: MessageCircle, color: 'from-amber-500/20 to-amber-500/5', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
          { label: 'Finalized', value: stats.finalized, icon: Heart, color: 'from-coral-500/20 to-coral-500/5', iconBg: 'bg-coral-500/10', iconColor: 'text-secondary' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="surface-default rounded-xl border border-white/5 p-5 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color}`} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-on-surface-variant/60 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-on-surface mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center border border-white/5`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer List */}
      <div className="surface-default rounded-xl border border-white/5 overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 border-b border-white/5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/30" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pulse-input w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white/5 border border-white/5"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={cn('w-3 h-3 transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>

        {showFilters && (
          <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-white/10 text-sm text-on-surface outline-none"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="verified">Verified</option>
              <option value="searching">Searching</option>
              <option value="matches_sent">Matches Sent</option>
              <option value="in_conversation">In Conversation</option>
              <option value="meeting_scheduled">Meeting Scheduled</option>
              <option value="finalized">Finalized</option>
              <option value="on_hold">On Hold</option>
            </select>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-white/10 text-sm text-on-surface outline-none"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        )}

        {/* Customer rows */}
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Heart className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-3" />
              <p className="text-on-surface-variant/60 font-medium">No clients found</p>
              <p className="text-sm text-on-surface-variant/30 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map((profile) => (
              <div
                key={profile.id}
                onClick={() => navigate(`/customer/${profile.id}`)}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.02] cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 border border-violet-500/15">
                  <span className="text-sm font-semibold text-primary">
                    {getInitials(profile.firstName, profile.lastName)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-on-surface truncate">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <span className="text-xs text-on-surface-variant/50">{profile.age} yrs</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/40">
                    {profile.city} &middot; {profile.designation}
                  </p>
                </div>
                <div className="hidden sm:block text-xs text-on-surface-variant/30 capitalize">
                  {profile.gender === 'male' ? '\u2642' : '\u2640'}
                </div>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    getStatusColor(profile.status),
                  )}
                >
                  {profile.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-white/5 text-center text-xs text-on-surface-variant/30">
          {filtered.length} of {profiles.length} clients
        </div>
      </div>
    </div>
  )
}
