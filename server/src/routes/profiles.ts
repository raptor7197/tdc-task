import { Router, Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import type { Profile, MatchmakerAccount } from '../lib/types'

const router = Router()

let profilesCache: Profile[] | null = null
let matchmakersCache: MatchmakerAccount[] | null = null

function loadProfiles(): Profile[] {
  if (!profilesCache) {
    const filePath = path.resolve(__dirname, '../data/profiles.json')
    profilesCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  }
  return profilesCache as Profile[]
}

function loadMatchmakers(): MatchmakerAccount[] {
  if (!matchmakersCache) {
    const filePath = path.resolve(__dirname, '../data/matchmakers.json')
    matchmakersCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  }
  return matchmakersCache as MatchmakerAccount[]
}

function refreshCache(): void {
  profilesCache = null
  matchmakersCache = null
}

export { refreshCache }

// GET /api/profiles/assigned — profiles assigned to current matchmaker
router.get('/assigned', authMiddleware, (req: AuthRequest, res: Response) => {
  const profiles = loadProfiles()
  const matchmakers = loadMatchmakers()
  const matchmaker = matchmakers.find((m) => m.id === req.matchmaker!.id)

  if (!matchmaker) {
    res.status(404).json({ error: 'Matchmaker not found' })
    return
  }

  let result = profiles.filter((p) => matchmaker.assignedProfileIds.includes(p.id))

  // Apply query filters
  const { status, gender, city, minAge, maxAge, religion, search } = req.query

  if (status) {
    result = result.filter((p) => p.status === status)
  }
  if (gender) {
    result = result.filter((p) => p.gender === gender)
  }
  if (city) {
    result = result.filter((p) => p.city.toLowerCase().includes((city as string).toLowerCase()))
  }
  if (minAge) {
    result = result.filter((p) => p.age >= Number(minAge))
  }
  if (maxAge) {
    result = result.filter((p) => p.age <= Number(maxAge))
  }
  if (religion) {
    result = result.filter((p) => p.religion.toLowerCase() === (religion as string).toLowerCase())
  }
  if (search) {
    const q = (search as string).toLowerCase()
    result = result.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q),
    )
  }

  res.json(result)
})

// GET /api/profiles — list all profiles (with optional filters, for admin view)
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const profiles = loadProfiles()
  let result = [...profiles]

  const { gender, city, religion, minAge, maxAge, status, search, excludeCustomer } = req.query

  if (gender) {
    result = result.filter((p) => p.gender === gender)
  }
  if (city) {
    result = result.filter((p) => p.city.toLowerCase().includes((city as string).toLowerCase()))
  }
  if (religion) {
    result = result.filter((p) => p.religion.toLowerCase() === (religion as string).toLowerCase())
  }
  if (minAge) {
    result = result.filter((p) => p.age >= Number(minAge))
  }
  if (maxAge) {
    result = result.filter((p) => p.age <= Number(maxAge))
  }
  if (status) {
    result = result.filter((p) => p.status === status)
  }
  if (search) {
    const q = (search as string).toLowerCase()
    result = result.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q),
    )
  }
  if (excludeCustomer) {
    result = result.filter((p) => p.id !== excludeCustomer)
  }

  res.json(result)
})

// GET /api/profiles/:id — single profile detail
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const profiles = loadProfiles()
  const profile = profiles.find((p) => p.id === req.params.id)

  if (!profile) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }

  res.json(profile)
})

export default router
