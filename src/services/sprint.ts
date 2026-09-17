/**
 * Sprint repository — in-memory mock implementation.
 */
import type { Sprint, SprintStatus } from '@/types/agile'
import { sprintStore } from './stores'
import { mockDelay } from './http'

export interface CreateSprintInput {
  projectId: string
  subProjectId?: string
  name: string
  goal?: string
  startDate: string
  endDate: string
}

export interface UpdateSprintInput extends Partial<CreateSprintInput> {
  status?: SprintStatus
}

export interface SprintListParams {
  projectId?: string
  subProjectId?: string
}

export const sprintRepository = {
  async list(projectId?: string, params?: SprintListParams): Promise<Sprint[]> {
    await mockDelay(300)
    const filters: Record<string, string | undefined> = {}
    if (params?.projectId ?? projectId) filters.projectId = (params?.projectId ?? projectId) as string
    if (params?.subProjectId) filters.subProjectId = params.subProjectId
    return sprintStore.query({ filters: Object.keys(filters).length ? filters : undefined, sort: { field: 'endDate', direction: 'desc' } }).items
  },

  async listByContext(context: { projectId: string; subProjectId?: string }): Promise<Sprint[]> {
    await mockDelay(300)
    const filters: Record<string, string | undefined> = { projectId: context.projectId }
    if (context.subProjectId) filters.subProjectId = context.subProjectId
    // Isolation: when subProjectId is specified, only return sprints for that sub-project.
    // When absent, return only project-level sprints (subProjectId falsy) — prevents EFA Sprint 16 leaking into UTLITE.
    return sprintStore
      .query({
        filters,
        match: (sprint) => (context.subProjectId ? sprint.subProjectId === context.subProjectId : !sprint.subProjectId),
        sort: { field: 'endDate', direction: 'desc' },
      })
      .items
  },

  async get(id: string): Promise<Sprint> {
    await mockDelay(200)
    const sprint = sprintStore.get(id)
    if (!sprint) throw new Error('Sprint not found')
    return sprint
  },

  async create(input: CreateSprintInput): Promise<Sprint> {
    await mockDelay(400)
    return sprintStore.create({
      ...input,
      id: undefined as never,
      status: 'planned',
      capacityHours: 0,
      hoursLogged: 0,
      velocity: 0,
      confidence: 0,
    } as unknown as Sprint)
  },

  async update(id: string, input: UpdateSprintInput): Promise<Sprint> {
    await mockDelay(300)
    const updated = sprintStore.update(id, input)
    if (!updated) throw new Error('Sprint not found')
    return updated
  },

  async start(id: string): Promise<Sprint> {
    await mockDelay(250)
    const updated = sprintStore.update(id, { status: 'active' })
    if (!updated) throw new Error('Sprint not found')
    return updated
  },

  async complete(id: string): Promise<Sprint> {
    await mockDelay(250)
    const updated = sprintStore.update(id, { status: 'completed' })
    if (!updated) throw new Error('Sprint not found')
    return updated
  },

  /** The next planned sprint for a project/sub-project (virtual "Backlog" if none is scheduled). */
  async backlog(projectId: string, subProjectId?: string): Promise<Sprint> {
    await mockDelay(200)
    const next = sprintStore.find(
      (sprint) => sprint.projectId === projectId && sprint.subProjectId === subProjectId && sprint.status === 'planned',
    )
    if (next) return next
    const now = new Date().toISOString()
    return sprintStore.create({
      projectId,
      subProjectId,
      name: 'Backlog',
      goal: 'Unscheduled, prioritized work.',
      startDate: now,
      endDate: now,
      status: 'planned',
      capacityHours: 0,
      hoursLogged: 0,
      velocity: 0,
      confidence: 0,
    } as unknown as Sprint)
  },
}