import { Router, Response } from 'express'
import * as fs from 'path'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import {
  generateMatchExplanation,
  generateIntroEmail,
  summarizeNotes,
  isConfigured,
} from '../lib/openai'
import type { Profile, MatchmakerAccount } from '../lib/types'

const router = Router()

let profilesCache: Profile[] | null = null
let matchmakersCache: MatchmakerAccount[] | null = null

function loadData(): { profiles: Profile[]; matchmakers: MatchmakerAccount[] } {
  if (!profilesCache) {
    const profilesPath = require('path').resolve(__dirname, '../data/profiles.json')
    profilesCache = require(profilesPath) as Profile[]
  }
  if (!matchmakersCache) {
    const mmPath = require('path').resolve(__dirname, '../data/matchmakers.json')
    matchmakersCache = require(mmPath) as MatchmakerAccount[]
  }
  return { profiles: profilesCache!, matchmakers: matchmakersCache! }
}

function profileToText(p: Profile): string {
  return [
    `Name: ${p.firstName} ${p.lastName}`,
    `Age: ${p.age}, Gender: ${p.gender}`,
    `Location: ${p.city}, ${p.country}`,
    `Religion: ${p.religion}, Caste: ${p.caste}, Mother Tongue: ${p.motherTongue}`,
    `Education: ${p.degree} from ${p.undergraduateCollege}`,
    `Profession: ${p.designation} at ${p.currentCompany}`,
    `Annual Income: ₹${(p.annualIncome / 100000).toFixed(1)}L`,
    `Height: ${p.height} cm`,
    `Marital Status: ${p.maritalStatus}`,
    `Diet: ${p.diet}, Drinking: ${p.drinking}, Smoking: ${p.smoking}`,
    `Want Kids: ${p.wantKids}, Open to Relocate: ${p.openToRelocate}, Open to Pets: ${p.openToPets}`,
    `Family: ${p.family.type}, Values: ${p.family.values}`,
    `Family BG: Father - ${p.family.fatherOccupation}, Mother - ${p.family.motherOccupation}`,
    `Manglik: ${p.manglik}`,
    `Languages: ${p.languagesKnown.join(', ')}`,
    `Hobbies: ${p.hobbies.join(', ')}`,
    `About: ${p.aboutMe}`,
    `Partner Preferences: Age ${p.partnerPreferences.ageMin}-${p.partnerPreferences.ageMax}, Income ₹${(p.partnerPreferences.incomeMin / 100000).toFixed(1)}L+`,
  ].join('\n')
}

// POST /api/ai/explain — AI match explanation
router.post('/explain', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { customerId, matchId } = req.body

  if (!customerId || !matchId) {
    res.status(400).json({ error: 'customerId and matchId are required' })
    return
  }

  const { profiles } = loadData()
  const customer = profiles.find((p) => p.id === customerId)
  const match = profiles.find((p) => p.id === matchId)

  if (!customer || !match) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }

  try {
    const explanation = await generateMatchExplanation(
      profileToText(customer),
      profileToText(match),
    )
    res.json({ explanation })
  } catch (error) {
    console.error('AI explain error:', error)
    res.status(500).json({ 
      explanation: 'Based on our matching algorithm, these profiles show compatibility across key dimensions including lifestyle, values, and life goals.',
      error: 'AI service temporarily unavailable',
    })
  }
})

// POST /api/ai/intro — AI-generated intro email
router.post('/intro', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { customerId, matchId } = req.body

  if (!customerId || !matchId) {
    res.status(400).json({ error: 'customerId and matchId are required' })
    return
  }

  const { profiles } = loadData()
  const customer = profiles.find((p) => p.id === customerId)
  const match = profiles.find((p) => p.id === matchId)

  if (!customer || !match) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }

  try {
    const email = await generateIntroEmail(
      profileToText(customer),
      profileToText(match),
      req.matchmaker!.name,
    )
    res.json({ email })
  } catch (error) {
    console.error('AI intro error:', error)
    res.status(500).json({
      email: `Hi,\n\nI came across a profile I think could be a wonderful match for you. ${match.firstName} ${match.lastName} is a ${match.age}-year-old professional based in ${match.city}. They share similar values and life goals that align well with what you're looking for.\n\nWould you like to know more? Let me know and I'd be happy to share the full details.\n\nWarmly,\n${req.matchmaker!.name}\nThe Date Crew`,
      error: 'AI service temporarily unavailable',
    })
  }
})

// POST /api/ai/summarize-notes — AI note summarizer
router.post('/summarize-notes', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { notes } = req.body

  if (!notes || !notes.trim()) {
    res.status(400).json({ error: 'Notes content is required' })
    return
  }

  try {
    const summary = await summarizeNotes(notes)
    res.json({ summary })
  } catch (error) {
    console.error('AI summarize error:', error)
    res.status(500).json({
      summary: 'Summary unavailable at this time.',
      error: 'AI service temporarily unavailable',
    })
  }
})

// GET /api/ai/status — check if AI is configured
router.get('/status', (req, res) => {
  res.json({ configured: isConfigured() })
})

export default router
