import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  matchmaker?: { id: string; email: string; name: string }
}

export function generateToken(_payload: { id: string; email: string; name: string }): string {
  return 'frontend-token'
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  req.matchmaker = { id: 'mm_001', email: 'priya@thedatecrew.com', name: 'Priya Sharma' }
  next()
}
