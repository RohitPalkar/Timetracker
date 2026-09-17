import type { FastifyRequest, FastifyReply } from 'fastify'
import { resolveMe } from '../modules/auth/service.js'
import { ApiError } from '../lib/errors.js'

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.' } })
  }
  const token = header.replace(/^Bearer\s+/i, '').trim()
  if (!token) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.' } })
  try {
    const me = await resolveMe(token)
    ;(req as any).auth = { token, me, user: me.user, organization: me.activeOrganization, membership: me.membership, roles: me.roles, permissions: me.permissions }
  } catch (err: any) {
    const status = err instanceof ApiError ? err.status : 401
    const code = err instanceof ApiError ? err.code : 'AUTH_INVALID'
    return reply.status(status).send({ error: { code, message: err.message ?? 'Authentication failed' } })
  }
}
