import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import bcrypt from 'bcryptjs'

import authRoutes from './routes/auth'
import profileRoutes from './routes/profiles'
import matchRoutes from './routes/matches'
import noteRoutes from './routes/notes'
import scoringRoutes from './routes/scoring'
import aiRoutes from './routes/ai'
import type { MatchmakerAccount } from './lib/types'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/scoring', scoringRoutes)
app.use('/api/ai', aiRoutes)

// Hash passwords on startup if they're plaintext
function ensureHashedPasswords(): void {
  const mmPath = path.resolve(__dirname, '../data/matchmakers.json')
  const raw = fs.readFileSync(mmPath, 'utf-8')
  const matchmakers: MatchmakerAccount[] = JSON.parse(raw)
  let changed = false

  for (const mm of matchmakers) {
    // Check if password is already hashed (bcrypt hashes start with $2)
    if (!mm.password.startsWith('$2')) {
      const hashed = bcrypt.hashSync(mm.password, 10)
      mm.password = hashed
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(mmPath, JSON.stringify(matchmakers, null, 2))
    console.log('Passwords hashed and saved.')
  }
}

ensureHashedPasswords()

app.listen(PORT, () => {
  console.log(`TDC Matchmaker API running on http://localhost:${PORT}`)
})
