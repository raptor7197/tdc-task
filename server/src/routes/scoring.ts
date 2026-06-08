import { Router, Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { computeBreakdown, totalScore } from '../lib/matching-algo'
import { PRESETS, DEFAULT_WEIGHTS, DEFAULT_WEIGHTS_FEMALE } from '../lib/types'
import type { ScoringConfig, ScoringWeights, Profile, ScoreBreakdown } from '../lib/types'

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

function saveConfig(config: ScoringConfig): void {
  const filePath = path.resolve(__dirname, '../data/scoring-config.json')
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
  configCache = config
}

// GET /api/scoring/config — get current weights
router.get('/config', authMiddleware, (req: AuthRequest, res: Response) => {
  const config = loadConfig()
  res.json(config)
})

// PUT /api/scoring/config — update weights
router.put('/config', authMiddleware, (req: AuthRequest, res: Response) => {
  const { weights, weightsFemale, activePreset, custom } = req.body
  const config = loadConfig()

  if (weights && typeof weights === 'object') {
    config.weights = { ...config.weights, ...weights }
  }
  if (weightsFemale && typeof weightsFemale === 'object') {
    config.weightsFemale = { ...config.weightsFemale, ...weightsFemale }
  }
  if (activePreset !== undefined) {
    config.activePreset = activePreset
  }
  if (custom !== undefined) {
    config.custom = custom
  }

  // If a valid preset key is given, load its weights
  if (activePreset && PRESETS[activePreset] && !custom) {
    config.weights = { ...PRESETS[activePreset].weights }
  }

  saveConfig(config)
  res.json(config)
})

// GET /api/scoring/presets — list available presets
router.get('/presets', authMiddleware, (req: AuthRequest, res: Response) => {
  const presets = Object.entries(PRESETS).map(([key, preset]) => ({
    key,
    ...preset,
  }))
  res.json(presets)
})

// POST /api/scoring/preview — compute score for two profiles with given weights
router.post('/preview', authMiddleware, (req: AuthRequest, res: Response) => {
  const { customerId, matchId, weights, weightsFemale } = req.body

  if (!customerId || !matchId) {
    res.status(400).json({ error: 'customerId and matchId are required' })
    return
  }

  const profiles = loadProfiles()
  const customer = profiles.find((p) => p.id === customerId)
  const match = profiles.find((p) => p.id === matchId)

  if (!customer || !match) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }

  const w: ScoringWeights =
    customer.gender === 'female'
      ? weightsFemale || DEFAULT_WEIGHTS_FEMALE
      : weights || DEFAULT_WEIGHTS

  const breakdown = computeBreakdown(customer, match, w)
  const score = totalScore(breakdown)

  res.json({
    customerId,
    matchId,
    score,
    breakdown,
    weights: w,
  })
})

export default router
