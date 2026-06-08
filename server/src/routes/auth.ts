import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth'
import type { MatchmakerAccount } from '../lib/types'

const router = Router()

function getMatchmakers(): MatchmakerAccount[] {
  const filePath = path.resolve(__dirname, '../data/matchmakers.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const matchmakers = getMatchmakers()
  const matchmaker = matchmakers.find((m) => m.email === email)

  if (!matchmaker) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const passwordMatch = await bcrypt.compare(password, matchmaker.password)
  if (!passwordMatch) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = generateToken({
    id: matchmaker.id,
    email: matchmaker.email,
    name: matchmaker.name,
  })

  res.json({
    token,
    user: {
      id: matchmaker.id,
      email: matchmaker.email,
      name: matchmaker.name,
      avatar: matchmaker.avatar,
    },
  })
})

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const matchmakers = getMatchmakers()
  const matchmaker = matchmakers.find((m) => m.id === req.matchmaker!.id)

  if (!matchmaker) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({
    id: matchmaker.id,
    email: matchmaker.email,
    name: matchmaker.name,
    avatar: matchmaker.avatar,
    assignedProfileIds: matchmaker.assignedProfileIds,
  })
})

export default router
