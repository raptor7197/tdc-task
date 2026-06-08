import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Phone, Mail, MapPin, Briefcase, GraduationCap, Users, UtensilsCrossed, Globe, MessageSquare, FileText, Sparkles, Send } from 'lucide-react'
import { api } from '../lib/api'
import { cn, getStatusColor, formatCurrency, formatDate, getInitials, getScoreColor, getScoreLabel, formatDateShort } from '../lib/utils'
import type { Profile, Note, MatchedProfile, ScoreBreakdown } from '../lib/types'
import { toast } from 'sonner'

const MARITAL_LABELS: Record<string, string> = {
  never_married: 'Never Married', divorced: 'Divorced', widowed: 'Widowed', awaiting_divorce: 'Awaiting Divorce',
}
const DIET_LABELS: Record<string, string> = { veg: 'Vegetarian', non_veg: 'Non-Vegetarian', eggetarian: 'Eggetarian', jain: 'Jain' }
const STATUS_LABELS: Record<string, string> = {
  new: 'New', verified: 'Verified', searching: 'Searching', matches_sent: 'Matches Sent',
  in_conversation: 'In Conversation', meeting_scheduled: 'Meeting Scheduled', finalized: 'Finalized', on_hold: 'On Hold',
}

function InfoRow({ label, value }: { label: string; value: string | number | React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs font-medium text-on-surface-variant/50 w-36 flex-shrink-0 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-on-surface/80">{value || '—'}</span>
    </div>
  )
}

function ScoreBreakdownBar({ breakdown }: { breakdown: ScoreBreakdown }) {
  const items = [
    { label: 'Religion/Caste', value: breakdown.religionCaste, color: 'bg-violet-500' },
    { label: 'Age', value: breakdown.age, color: 'bg-pink-500' },
    { label: 'Education', value: breakdown.education, color: 'bg-blue-500' },
    { label: 'Income', value: breakdown.income, color: 'bg-amber-500' },
    { label: 'Height', value: breakdown.height, color: 'bg-cyan-500' },
    { label: 'Location', value: breakdown.location, color: 'bg-emerald-500' },
    { label: 'Want Kids', value: breakdown.wantKids, color: 'bg-teal-500' },
    { label: 'Diet', value: breakdown.diet, color: 'bg-lime-500' },
    { label: 'Family Values', value: breakdown.familyValues, color: 'bg-orange-500' },
    { label: 'Lifestyle', value: breakdown.lifestyle, color: 'bg-rose-500' },
  ]

  const total = items.reduce((s, i) => s + i.value, 0)

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs">
          <span className="w-24 text-on-surface-variant/50 text-right">{item.label}</span>
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', item.color)}
              style={{ width: `${(item.value / 30) * 100}%` }}
            />
          </div>
          <span className="w-6 text-on-surface/60 font-medium text-right">{item.value}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 text-xs pt-2 border-t border-white/5">
        <span className="w-24 text-on-surface-variant/50 text-right font-medium">Total</span>
        <div className="flex-1 text-center">
          <span className={cn('font-bold text-sm', total >= 80 ? 'text-emerald-400' : total >= 60 ? 'text-blue-400' : 'text-amber-400')}>
            {total}/100
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<MatchedProfile[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'biodata' | 'matches' | 'notes'>('biodata')
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<'call' | 'meeting' | 'email' | 'general'>('general')
  const [sendingNote, setSendingNote] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState<string | null>(null)
  const [aiIntro, setAiIntro] = useState('')
  const [generatingIntro, setGeneratingIntro] = useState(false)
  const [explainingMatch, setExplainingMatch] = useState<string | null>(null)
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.getProfile(id),
      api.getMatches(id),
      api.getNotes(id),
    ])
      .then(([profile, matches, notes]) => {
        setProfile(profile)
        setMatches(matches)
        setNotes(notes)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return
    setSendingNote(true)
    try {
      const note = await api.addNote(id, newNote.trim(), noteType)
      setNotes((prev) => [note, ...prev])
      setNewNote('')
      toast.success('Note added', { style: { background: '#1b1b1d', color: '#e5e1e4', border: '1px solid rgba(255,255,255,0.08)' } })
    } catch {
      toast.error('Failed to add note', { style: { background: '#1b1b1d', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' } })
    } finally {
      setSendingNote(false)
    }
  }

  const handleSendMatch = async (matchedProfileId: string) => {
    if (!id) return
    try {
      await api.sendMatch(id, matchedProfileId, aiIntro)
      toast.success('Match sent successfully!', { style: { background: '#1b1b1d', color: '#e5e1e4', border: '1px solid rgba(139,92,246,0.3)' } })
      setShowMatchModal(null)
    } catch {
      toast.error('Failed to send match', { style: { background: '#1b1b1d', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' } })
    }
  }

  const openMatchModal = async (matchProfileId: string) => {
    setShowMatchModal(matchProfileId)
    setAiIntro('')
    setGeneratingIntro(true)
    try {
      const result = await api.getAiIntro(id!, matchProfileId)
      setAiIntro(result.email)
    } catch {
      setAiIntro('Hi,\n\nI came across a profile I think could be a wonderful match. Would you like to know more?\n\nWarmly,\nYour Matchmaker')
    } finally {
      setGeneratingIntro(false)
    }
  }

  const getExplanation = async (matchProfileId: string) => {
    if (aiExplanations[matchProfileId]) return
    setExplainingMatch(matchProfileId)
    try {
      const result = await api.getAiExplanation(id!, matchProfileId)
      setAiExplanations((prev) => ({ ...prev, [matchProfileId]: result.explanation }))
    } catch {
      setAiExplanations((prev) => ({ ...prev, [matchProfileId]: 'AI explanation unavailable.' }))
    } finally {
      setExplainingMatch(null)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-white/5 rounded" />
        <div className="h-48 surface-default rounded-xl border border-white/5" />
        <div className="h-64 surface-default rounded-xl border border-white/5" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-3" />
        <p className="text-on-surface-variant/60">Profile not found</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-sm text-primary hover:underline">Back to dashboard</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Profile Header */}
      <div className="surface-default rounded-xl border border-white/5 p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-violet-500/5 blur-[80px]" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-coral-500/20 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
            <span className="text-xl font-bold text-primary">{getInitials(profile.firstName, profile.lastName)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-xl font-bold text-on-surface">{profile.firstName} {profile.lastName}</h1>
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', getStatusColor(profile.status))}>
                {STATUS_LABELS[profile.status] || profile.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-on-surface-variant/60 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.city}, {profile.country}</span>
              <span>{profile.age} yrs &middot; {profile.height} cm</span>
              <span className="capitalize">{profile.gender}</span>
              <span>{MARITAL_LABELS[profile.maritalStatus] || profile.maritalStatus}</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <a href={`mailto:${profile.email}`} className="chip">
                <Mail className="w-3 h-3" /> Email
              </a>
              <a href={`tel:${profile.phoneNumber}`} className="chip">
                <Phone className="w-3 h-3" /> Call
              </a>
            </div>
          </div>
          <div className="text-right text-xs text-on-surface-variant/30">
            <p>Created: {formatDate(profile.createdAt)}</p>
            <p className="mt-0.5">Profile by: {profile.profileCreatedBy?.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="surface-default rounded-xl border border-white/5 overflow-hidden">
        <div className="flex border-b border-white/5">
          {[
            { key: 'biodata', label: 'Biodata', icon: FileText },
            { key: 'matches', label: `Matches (${matches.length})`, icon: Heart },
            { key: 'notes', label: `Notes (${notes.length})`, icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-[1px]',
                activeTab === tab.key
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant/50 border-transparent hover:text-on-surface-variant/80 hover:bg-white/[0.02]',
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* BIODATA TAB */}
          {activeTab === 'biodata' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-3"><Users className="w-3 h-3 inline mr-1" /> Personal Details</h3>
                <InfoRow label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
                <InfoRow label="Gender" value={profile.gender} />
                <InfoRow label="Date of Birth" value={profile.dateOfBirth} />
                <InfoRow label="Age" value={`${profile.age} years`} />
                <InfoRow label="Height" value={`${profile.height} cm`} />
                <InfoRow label="Body Type" value={profile.bodyType} />
                <InfoRow label="Complexion" value={profile.complexion} />
                <InfoRow label="Marital Status" value={MARITAL_LABELS[profile.maritalStatus]} />
                <InfoRow label="Have Children" value={profile.haveChildren ? 'Yes' : 'No'} />

                <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-3 mt-6"><MapPin className="w-3 h-3 inline mr-1" /> Location</h3>
                <InfoRow label="Country" value={profile.country} />
                <InfoRow label="City" value={profile.city} />
                <InfoRow label="Open to Relocate" value={profile.openToRelocate} />

                <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-3 mt-6"><GraduationCap className="w-3 h-3 inline mr-1" /> Education</h3>
                <InfoRow label="College" value={profile.undergraduateCollege} />
                <InfoRow label="Degree" value={profile.degree} />
                <InfoRow label="Details" value={profile.educationDetails} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-3"><Briefcase className="w-3 h-3 inline mr-1" /> Career</h3>
                <InfoRow label="Company" value={profile.currentCompany} />
                <InfoRow label="Designation" value={profile.designation} />
                <InfoRow label="Annual Income" value={formatCurrency(profile.annualIncome, profile.incomeCurrency)} />
                <InfoRow label="Working With" value={profile.workingWith} />
                <InfoRow label="Profession Area" value={profile.professionArea} />

                <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-3 mt-6"><Globe className="w-3 h-3 inline mr-1" /> Cultural & Religious</h3>
                <InfoRow label="Religion" value={profile.religion} />
                <InfoRow label="Caste" value={profile.caste} />
                <InfoRow label="Sub-Caste" value={profile.subCaste} />
                <InfoRow label="Gothra" value={profile.gothra} />
                <InfoRow label="Mother Tongue" value={profile.motherTongue} />
                <InfoRow label="Languages" value={profile.languagesKnown?.join(', ')} />
                <InfoRow label="Manglik" value={profile.manglik} />
                <InfoRow label="Star/Raasi" value={profile.starRaasi} />

                <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-3 mt-6"><UtensilsCrossed className="w-3 h-3 inline mr-1" /> Lifestyle</h3>
                <InfoRow label="Diet" value={DIET_LABELS[profile.diet] || profile.diet} />
                <InfoRow label="Drinking" value={profile.drinking} />
                <InfoRow label="Smoking" value={profile.smoking} />
                <InfoRow label="Hobbies" value={profile.hobbies?.join(', ')} />
                <InfoRow label="Want Kids" value={profile.wantKids} />
                <InfoRow label="Open to Pets" value={profile.openToPets} />

                <h3 className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-3 mt-6"><Users className="w-3 h-3 inline mr-1" /> Family</h3>
                <InfoRow label="Family Type" value={profile.family?.type} />
                <InfoRow label="Family Values" value={profile.family?.values} />
                <InfoRow label="Father's Occ." value={profile.family?.fatherOccupation} />
                <InfoRow label="Mother's Occ." value={profile.family?.motherOccupation} />
                <InfoRow label="Siblings" value={profile.siblings?.map((s) => `${s.count} ${s.type}(s)`).join(', ')} />
              </div>
            </div>
          )}

          {/* MATCHES TAB */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-10 h-10 text-on-surface-variant/20 mx-auto mb-2" />
                  <p className="text-on-surface-variant/60">No matches found for this client yet</p>
                  <p className="text-xs text-on-surface-variant/30 mt-1">Try adjusting the scoring weights on the Scoring Config page</p>
                </div>
              ) : (
                matches.map((match) => (
                  <div key={match.profile.id} className="surface-container-low rounded-xl border border-white/5 p-4 hover:border-violet-500/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-coral-500/20 flex items-center justify-center flex-shrink-0 border border-violet-500/15">
                        <span className="text-sm font-bold text-primary">{getInitials(match.profile.firstName, match.profile.lastName)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-semibold text-on-surface">{match.profile.firstName} {match.profile.lastName}</h3>
                          <span className="text-sm text-on-surface-variant/50">{match.profile.age} yrs</span>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', getScoreColor(match.score))}>
                            {match.score} &middot; {getScoreLabel(match.score)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant/40 mt-0.5">
                          {match.profile.city} &middot; {match.profile.designation} at {match.profile.currentCompany} &middot; {DIET_LABELS[match.profile.diet] || match.profile.diet} &middot; {match.profile.religion}, {match.profile.motherTongue}
                        </p>

                        {aiExplanations[match.profile.id] && (
                          <div className="mt-2 p-2.5 bg-violet-500/5 rounded-lg border border-violet-500/15">
                            <p className="text-xs text-primary/80">{aiExplanations[match.profile.id]}</p>
                          </div>
                        )}

                        <details className="mt-2">
                          <summary className="text-xs text-primary/60 cursor-pointer hover:text-primary">View score breakdown</summary>
                          <div className="mt-2 p-3 surface-container rounded-lg border border-white/5">
                            <ScoreBreakdownBar breakdown={match.breakdown} />
                          </div>
                        </details>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => getExplanation(match.profile.id)}
                          disabled={explainingMatch === match.profile.id}
                          className="btn-secondary flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                        >
                          <Sparkles className="w-3 h-3" />
                          {explainingMatch === match.profile.id ? '...' : 'Explain'}
                        </button>
                        <button
                          onClick={() => openMatchModal(match.profile.id)}
                          className="btn-primary flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                        >
                          <Send className="w-3 h-3" /> Send Match
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="surface-container-low rounded-xl border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/10 text-xs text-on-surface outline-none"
                  >
                    <option value="general">General</option>
                    <option value="call">Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="email">Email</option>
                  </select>
                  <span className="text-xs text-on-surface-variant/40">Note type</span>
                </div>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record notes from your meeting or call..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500/40 outline-none text-sm resize-none min-h-[80px] text-on-surface placeholder-on-surface-variant/30 transition-colors"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || sendingNote}
                    className="btn-primary flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm disabled:opacity-40"
                  >
                    {sendingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 text-on-surface-variant/20 mx-auto mb-2" />
                  <p className="text-on-surface-variant/60">No notes yet</p>
                  <p className="text-xs text-on-surface-variant/30 mt-1">Start recording your interactions above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="surface-container-low rounded-lg border border-white/5 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-500/10 text-primary border border-violet-500/15 capitalize">{note.type}</span>
                          <span className={cn('px-2 py-0.5 rounded text-xs font-medium border',
                            note.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            note.sentiment === 'negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-on-surface-variant/60 border-white/10')}>
                            {note.sentiment}
                          </span>
                        </div>
                        <span className="text-xs text-on-surface-variant/30">{formatDateShort(note.createdAt)}</span>
                      </div>
                      <p className="text-sm text-on-surface/80 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Send Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowMatchModal(null)}>
          <div className="surface-high rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5">
              <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary" /> Send Match
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 surface-container-low rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-coral-500/20 flex items-center justify-center border border-violet-500/15">
                  <span className="text-sm font-bold text-primary">
                    {getInitials(
                      matches.find((m) => m.profile.id === showMatchModal)?.profile.firstName || '',
                      matches.find((m) => m.profile.id === showMatchModal)?.profile.lastName || '',
                    )}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-on-surface text-sm">
                    {matches.find((m) => m.profile.id === showMatchModal)?.profile.firstName}{' '}
                    {matches.find((m) => m.profile.id === showMatchModal)?.profile.lastName}
                  </p>
                  <p className="text-xs text-on-surface-variant/50">
                    {matches.find((m) => m.profile.id === showMatchModal)?.profile.age} yrs &middot;{' '}
                    {matches.find((m) => m.profile.id === showMatchModal)?.profile.city} &middot;{' '}
                    {matches.find((m) => m.profile.id === showMatchModal)?.profile.designation}
                  </p>
                </div>
                <span className={cn('ml-auto px-2 py-0.5 rounded-full text-xs font-medium border', getScoreColor(matches.find((m) => m.profile.id === showMatchModal)?.score || 0))}>
                  {matches.find((m) => m.profile.id === showMatchModal)?.score || 0}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-on-surface/80 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Intro Email
                  </label>
                  <button
                    onClick={() => {
                      if (!id || !showMatchModal) return
                      setGeneratingIntro(true)
                      api.getAiIntro(id, showMatchModal).then((r) => setAiIntro(r.email)).catch(() => {}).finally(() => setGeneratingIntro(false))
                    }}
                    disabled={generatingIntro}
                    className="text-xs text-primary/60 hover:text-primary"
                  >
                    {generatingIntro ? 'Generating...' : 'Regenerate'}
                  </button>
                </div>
                <textarea
                  value={aiIntro}
                  onChange={(e) => setAiIntro(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500/40 outline-none text-sm resize-none min-h-[150px] text-on-surface placeholder-on-surface-variant/30"
                  rows={6}
                  placeholder="Generating AI intro..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-white/5 flex justify-end gap-3">
              <button onClick={() => setShowMatchModal(null)} className="btn-secondary px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={() => handleSendMatch(showMatchModal)}
                className="btn-coral flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
              >
                <Send className="w-4 h-4" /> Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
