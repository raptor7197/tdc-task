import { useState, useEffect, useMemo } from 'react'
import { Sliders, RotateCcw, Save, Heart, Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import { cn } from '../lib/utils'
import type { ScoringConfig, ScoringWeights, ScoringPreset, Profile } from '../lib/types'
import { toast } from 'sonner'

const SCORING_FIELDS: { key: keyof ScoringWeights; label: string; description: string }[] = [
  { key: 'religionCaste', label: 'Religion & Caste', description: 'Same religion and caste compatibility' },
  { key: 'age', label: 'Age', description: 'Age gap within traditional norms' },
  { key: 'education', label: 'Education', description: 'Education level compatibility' },
  { key: 'income', label: 'Income', description: 'Income expectation alignment' },
  { key: 'height', label: 'Height', description: 'Height preference matching' },
  { key: 'location', label: 'Location', description: 'Same city or relocation openness' },
  { key: 'wantKids', label: 'Want Children', description: 'Alignment on having children' },
  { key: 'diet', label: 'Diet', description: 'Dietary preference compatibility' },
  { key: 'familyValues', label: 'Family Values', description: 'Family type and value alignment' },
  { key: 'lifestyle', label: 'Lifestyle', description: 'Pets, drinking, smoking alignment' },
]

export default function ScoringConfigPage() {
  const [config, setConfig] = useState<ScoringConfig | null>(null)
  const [presets, setPresets] = useState<ScoringPreset[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'male' | 'female'>('male')
  const [editingWeights, setEditingWeights] = useState<ScoringWeights | null>(null)
  const [editingWeightsFemale, setEditingWeightsFemale] = useState<ScoringWeights | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [previewCustomer, setPreviewCustomer] = useState('')
  const [previewMatch, setPreviewMatch] = useState('')
  const [previewResult, setPreviewResult] = useState<any>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      api.getScoringConfig(),
      api.getScoringPresets(),
      api.getProfiles(),
    ]).then(([config, presets, profiles]) => {
      setConfig(config)
      setPresets(presets)
      setEditingWeights({ ...config.weights })
      setEditingWeightsFemale({ ...config.weightsFemale })
      setProfiles(profiles.filter((p: Profile) => p.gender === 'male'))
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const totalWeights = useMemo(() => {
    const w = activeTab === 'male' ? editingWeights : editingWeightsFemale
    if (!w) return 0
    return Object.values(w).reduce((sum: number, v: number) => sum + v, 0)
  }, [editingWeights, editingWeightsFemale, activeTab])

  const handleWeightChange = (key: keyof ScoringWeights, value: number) => {
    if (activeTab === 'male' && editingWeights) {
      setEditingWeights({ ...editingWeights, [key]: value })
    } else if (activeTab === 'female' && editingWeightsFemale) {
      setEditingWeightsFemale({ ...editingWeightsFemale, [key]: value })
    }
  }

  const applyPreset = (preset: ScoringPreset) => {
    setEditingWeights({ ...preset.weights })
    setEditingWeightsFemale({ ...preset.weights })
    setConfig((prev) => prev ? { ...prev, activePreset: preset.key, custom: false } : prev)
    toast.success(`Applied "${preset.label}" preset`, { style: { background: '#1b1b1d', color: '#e5e1e4', border: '1px solid rgba(255,255,255,0.08)' } })
  }

  const normalizeWeights = () => {
    const target = activeTab === 'male' ? editingWeights : editingWeightsFemale
    if (!target) return
    const currentTotal = Object.values(target).reduce((s, v) => s + v, 0)
    if (currentTotal === 0) return
    const factor = 100 / currentTotal
    const normalized = Object.fromEntries(
      Object.entries(target).map(([k, v]) => [k, Math.round((v as number) * factor)]),
    ) as unknown as ScoringWeights
    const newTotal = Object.values(normalized).reduce((s, v) => s + v, 0)
    const diff = 100 - newTotal
    const firstKey = Object.keys(normalized)[0] as keyof ScoringWeights
    normalized[firstKey] = Math.max(0, normalized[firstKey] + diff)

    if (activeTab === 'male') setEditingWeights(normalized)
    else setEditingWeightsFemale(normalized)
    toast.success('Weights normalized to 100', { style: { background: '#1b1b1d', color: '#e5e1e4', border: '1px solid rgba(255,255,255,0.08)' } })
  }

  const handleSave = async () => {
    if (!editingWeights || !editingWeightsFemale) return
    if (Object.values(editingWeights).reduce((s, v) => s + v, 0) !== 100 ||
        Object.values(editingWeightsFemale).reduce((s, v) => s + v, 0) !== 100) {
      toast.error('Both weight sets must sum to 100', { style: { background: '#1b1b1d', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' } })
      return
    }
    try {
      const updated = await api.updateScoringConfig({ weights: editingWeights, weightsFemale: editingWeightsFemale, custom: true, activePreset: null })
      setConfig(updated)
      toast.success('Scoring weights saved!', { style: { background: '#1b1b1d', color: '#e5e1e4', border: '1px solid rgba(139,92,246,0.3)' } })
    } catch {
      toast.error('Failed to save weights', { style: { background: '#1b1b1d', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' } })
    }
  }

  const handlePreview = async () => {
    if (!previewCustomer || !previewMatch) return
    setPreviewLoading(true)
    try {
      const result = await api.previewScore(previewCustomer, previewMatch, editingWeights!, editingWeightsFemale!)
      setPreviewResult(result)
    } catch {
      toast.error('Preview failed', { style: { background: '#1b1b1d', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' } })
    } finally {
      setPreviewLoading(false)
    }
  }

  const filteredMatchProfiles = profiles.filter((p) => p.gender === 'female')

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded" />
        <div className="h-96 surface-default rounded-xl border border-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
          <Sliders className="w-5 h-5 text-primary" /> Scoring Configuration
        </h1>
        <p className="text-sm text-on-surface-variant/50 mt-1">Customize how match scores are calculated for male and female customers</p>
      </div>

      {/* Presets */}
      <div className="surface-default rounded-xl border border-white/5 p-5">
        <h2 className="text-sm font-semibold text-on-surface/80 mb-3 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-secondary" /> Presets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all',
                config?.activePreset === preset.key && !config?.custom
                  ? 'border-violet-500/40 bg-violet-500/10'
                  : 'border-white/10 hover:border-violet-500/20 bg-white/[0.02]',
              )}
            >
              <p className="font-display font-semibold text-sm text-on-surface">{preset.label}</p>
              <p className="text-xs text-on-surface-variant/40 mt-0.5 line-clamp-2">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Weight Sliders */}
      <div className="surface-default rounded-xl border border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('male')}
              className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', activeTab === 'male' ? 'bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant/50')}
            >Male Customers</button>
            <button
              onClick={() => setActiveTab('female')}
              className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors', activeTab === 'female' ? 'bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant/50')}
            >Female Customers</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={normalizeWeights} className="text-xs text-primary/60 hover:text-primary flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Normalize
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs">
              <Save className="w-3 h-3" /> Save
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {SCORING_FIELDS.map((field) => {
            const value = activeTab === 'male' ? editingWeights?.[field.key] ?? 0 : editingWeightsFemale?.[field.key] ?? 0
            return (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <label className="text-sm font-medium text-on-surface/80">{field.label}</label>
                    <p className="text-xs text-on-surface-variant/40">{field.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary w-8 text-right">{value}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={value}
                  onChange={(e) => handleWeightChange(field.key, Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-violet-500/30"
                />
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-sm font-medium text-on-surface/80">Total Weight</span>
          <span className={cn('text-lg font-bold', totalWeights === 100 ? 'text-emerald-400' : totalWeights > 100 ? 'text-red-400' : 'text-amber-400')}>
            {totalWeights}/100
          </span>
        </div>
      </div>

      {/* Live Preview */}
      <div className="surface-default rounded-xl border border-white/5 p-5">
        <h2 className="text-sm font-semibold text-on-surface/80 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" /> Live Preview
        </h2>
        <p className="text-xs text-on-surface-variant/40 mb-4">Select two profiles to see how the current weights affect their match score</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-on-surface-variant/50 mb-1 block">Customer Profile</label>
            <select
              value={previewCustomer}
              onChange={(e) => { setPreviewCustomer(e.target.value); setPreviewResult(null) }}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-white/10 text-sm text-on-surface outline-none"
            >
              <option value="">Select a customer...</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.age}, {p.city})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-on-surface-variant/50 mb-1 block">Match Profile</label>
            <select
              value={previewMatch}
              onChange={(e) => { setPreviewMatch(e.target.value); setPreviewResult(null) }}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-white/10 text-sm text-on-surface outline-none"
            >
              <option value="">Select a match...</option>
              {filteredMatchProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.age}, {p.city})</option>
              ))}
            </select>
          </div>
        </div>

        {previewCustomer && previewMatch && (
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm disabled:opacity-40"
          >
            {previewLoading ? 'Computing...' : 'Preview Score'}
          </button>
        )}

        {previewResult && (
          <div className="mt-4 p-4 surface-container-low rounded-xl border border-violet-500/15">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-on-surface/80">Match Score</span>
              <span className={cn('text-2xl font-bold', previewResult.score >= 80 ? 'text-emerald-400' : previewResult.score >= 60 ? 'text-blue-400' : 'text-amber-400')}>
                {previewResult.score}/100
              </span>
            </div>
            <div className="space-y-1.5">
              {SCORING_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-2 text-xs">
                  <span className="w-28 text-on-surface-variant/50">{field.label}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${(previewResult.breakdown[field.key] / 30) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-on-surface/60 font-medium text-right">{previewResult.breakdown[field.key]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
