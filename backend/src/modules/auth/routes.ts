import type { FastifyInstance } from 'fastify'
import { parseOrThrow } from '../../lib/validation.js'
import { requestOtpSchema, verifyOtpSchema } from './schemas.js'
import { requestOtp, verifyOtp, resolveMe } from './service.js'
import { authMiddleware } from '../../plugins/auth.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/v1/auth/request-otp', async (req, reply) => {
    const { email } = parseOrThrow(requestOtpSchema, req.body)
    await requestOtp(email)
    return { ok: true }
  })

  app.post('/api/v1/auth/verify-otp', async (req, reply) => {
    const { email, code } = parseOrThrow(verifyOtpSchema, req.body)
    const { access_token, refresh_token } = await verifyOtp(email, code)
    return { access_token, refresh_token, token_type: 'Bearer' }
  })

  app.post('/api/v1/auth/logout', async (_req, reply) => {
    // Supabase logout is client-driven via token invalidation; backend just acknowledges
    return { ok: true }
  })

  app.get('/api/v1/auth/me', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const me = (req as any).auth?.me
    if (!me) {
      const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
      const resolved = await resolveMe(token)
      return resolved
    }
    return me
  })
}
