import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../plugins/auth.js'
import { parseOrThrow } from '../../lib/validation.js'
import { createProjectSchema, updateProjectSchema, createSubProjectSchema, addMemberSchema } from './schemas.js'
import * as svc from './service.js'

export async function projectRoutes(app: FastifyInstance) {
  // Projects
  app.get('/api/v1/projects', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const q = req.query as any
    return svc.listProjects(auth, { search: q?.search, status: q?.status })
  })

  app.post('/api/v1/projects', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const body = parseOrThrow(createProjectSchema, req.body)
    return svc.createProject(auth, body)
  })

  app.get('/api/v1/projects/:projectId', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { projectId } = req.params as any
    return svc.getProject(auth, projectId)
  })

  app.patch('/api/v1/projects/:projectId', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { projectId } = req.params as any
    const body = parseOrThrow(updateProjectSchema, req.body)
    return svc.updateProject(auth, projectId, body)
  })

  app.delete('/api/v1/projects/:projectId', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { projectId } = req.params as any
    return svc.deleteProject(auth, projectId)
  })

  // Sub-projects
  app.get('/api/v1/projects/:projectId/sub-projects', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { projectId } = req.params as any
    return svc.listSubProjects(auth, projectId)
  })

  app.post('/api/v1/projects/:projectId/sub-projects', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { projectId } = req.params as any
    const body = parseOrThrow(createSubProjectSchema, req.body)
    return svc.createSubProject(auth, projectId, body)
  })

  app.patch('/api/v1/sub-projects/:subProjectId', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { subProjectId } = req.params as any
    const body = parseOrThrow(createSubProjectSchema.partial(), req.body)
    return svc.updateSubProject(auth, subProjectId, body)
  })

  app.delete('/api/v1/sub-projects/:subProjectId', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { subProjectId } = req.params as any
    return svc.deleteSubProject(auth, subProjectId)
  })

  // Members
  app.get('/api/v1/projects/:projectId/members', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { projectId } = req.params as any
    return svc.listMembers(auth, projectId)
  })

  app.post('/api/v1/projects/:projectId/members', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { projectId } = req.params as any
    const body = parseOrThrow(addMemberSchema, req.body)
    return svc.addMember(auth, projectId, body)
  })

  app.delete('/api/v1/projects/:projectId/members/:userId', { preHandler: [authMiddleware] }, async (req, _reply) => {
    const auth = (req as any).auth
    const { projectId, userId } = req.params as any
    return svc.removeMember(auth, projectId, userId)
  })
}
