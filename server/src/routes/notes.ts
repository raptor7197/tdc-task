import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import type { Note } from '../lib/types'

const router = Router()

// In-memory notes storage (MVP — no DB)
const notes: Note[] = []

// GET /api/notes/:profileId — get notes for a customer
router.get('/:profileId', authMiddleware, (req: AuthRequest, res: Response) => {
  const profileNotes = notes
    .filter((n) => n.profileId === req.params.profileId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  res.json(profileNotes)
})

// POST /api/notes/:profileId — add a note
router.post('/:profileId', authMiddleware, (req: AuthRequest, res: Response) => {
  const { content, type, sentiment } = req.body

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Note content is required' })
    return
  }

  const note: Note = {
    id: `note_${Date.now()}`,
    profileId: req.params.profileId,
    matchmakerId: req.matchmaker!.id,
    content: content.trim(),
    type: type || 'general',
    sentiment: sentiment || 'neutral',
    createdAt: new Date().toISOString(),
  }

  notes.push(note)
  res.status(201).json(note)
})

export default router
