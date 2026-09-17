import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../plugins/auth.js'
import { parseOrThrow } from '../../lib/validation.js'
import { createTeamSchema, updateTeamSchema } from './schemas.js'
import * as svc from './service.js'

export async function teamRoutes(app: FastifyInstance) {
  app.get('/api/v1/teams', { preHandler: [authMiddleware] }, async (req) => svc.listTeams((req as any).auth))
  app.post('/api/v1/teams', { preHandler: [authMiddleware] }, async (req) => {
    const body = parseOrThrow(createTeamSchema, req.body)
    return svc.createTeam((req as any).auth, body)
  })
  app.get('/api/v1/teams/:teamId', { preHandler: [authMiddleware] }, async (req) => svc.getTeam((req as any).auth, (req.params as any).teamId))
  app.patch('/api/v1/teams/:teamId', { preHandler: [authMiddleware] }, async (req) => {
    const body = parseOrThrow(updateTeamSchema, req.body)
    return svc.updateTeam((req as any).auth, (req.params as any).teamId, body)
  })
  app.delete('/api/v1/teams/:teamId', { preHandler: [authMiddleware] }, async (req) => svc.deleteTeam((req as any).auth, (req.params as any).teamId))
}
