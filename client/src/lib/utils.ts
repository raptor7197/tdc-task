import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    const lakhs = amount / 100000
    if (lakhs >= 1) return `₹${lakhs.toFixed(1)}L`
    return `₹${(amount / 1000).toFixed(0)}K`
  }
  return `$${(amount / 100000).toFixed(1)}L`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return formatDate(dateStr)
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
  if (score >= 60) return 'text-blue-400 border-blue-500/40 bg-blue-500/10'
  if (score >= 40) return 'text-amber-400 border-amber-500/40 bg-amber-500/10'
  return 'text-gray-500 border-gray-500/30 bg-gray-500/10'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'High Potential Match'
  if (score >= 60) return 'Good Match'
  if (score >= 40) return 'Moderate Match'
  return 'Low Match'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'text-violet-300 border-violet-500/30 bg-violet-500/10',
    verified: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
    searching: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    matches_sent: 'text-pink-300 border-pink-500/30 bg-pink-500/10',
    in_conversation: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    meeting_scheduled: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
    finalized: 'text-green-300 border-green-500/30 bg-green-500/10',
    on_hold: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
  }
  return colors[status] || 'text-gray-400 border-gray-500/30 bg-gray-500/10'
}
