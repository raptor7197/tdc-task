import { Router, Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { findMatches } from '../lib/matching-algo'
import type { Profile, MatchHistoryEntry, ScoringWeights, ScoringConfig } from '../lib/types'

const router = Router()

let profilesCache: Profile[] | null = null
let configCache: ScoringConfig | null = null

function loadProfiles(): Profile[] {
  if (!profilesCache) {
    const filePath = path.resolve(__dirname, '../data/profiles.json')
    profilesCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  }
  return profilesCache as Profile[]
}

function loadConfig(): ScoringConfig {
  if (!configCache) {
    const filePath = path.resolve(__dirname, '../data/scoring-config.json')
    configCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  }
  return configCache as ScoringConfig
}

function refreshCache(): void {
  profilesCache = null
  configCache = null
}

export { refreshCache }

// In-memory match history (MVP — no DB)
const matchHistory: MatchHistoryEntry[] = []

// GET /api/matches/:profileId — get top matches for a customer
router.get('/:profileId', authMiddleware, (req: AuthRequest, res: Response) => {
  const profiles = loadProfiles()
  const config = loadConfig()

  const customer = profiles.find((p) => p.id === req.params.profileId)
  if (!customer) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }

  // Pick weights based on customer gender
  const weights: ScoringWeights =
    customer.gender === 'female' ? config.weightsFemale : config.weights

  const candidates = profiles.filter(
    (p) => p.gender !== customer.gender && p.id !== customer.id,
  )

  const matches = findMatches(customer, candidates, weights, 15)
  res.json(matches)
})

// POST /api/matches/send — record a match being sent
router.post('/send', authMiddleware, (req: AuthRequest, res: Response) => {
  const { customerProfileId, matchedProfileId, aiIntro } = req.body

  if (!customerProfileId || !matchedProfileId) {
    res.status(400).json({ error: 'customerProfileId and matchedProfileId are required' })
    return
  }

  const entry: MatchHistoryEntry = {
    id: `match_${Date.now()}`,
    customerProfileId,
    matchedProfileId,
    matchmakerId: req.matchmaker!.id,
    status: 'sent',
    aiIntro: aiIntro || '',
    sentAt: new Date().toISOString(),
  }

  matchHistory.push(entry)
  res.json(entry)
})

// GET /api/matches/history/:profileId — get match history for a customer
router.get('/history/:profileId', authMiddleware, (req: AuthRequest, res: Response) => {
  const history = matchHistory.filter(
    (m) => m.customerProfileId === req.params.profileId || m.matchedProfileId === req.params.profileId,
  )
  res.json(history)
})

export default router
