import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../plugins/auth.js'
import { getDashboard } from './service.js'

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/api/v1/dashboard', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const data = await getDashboard(auth)
    return data
  })
}
