/**
 * Sprint repository — in-memory mock implementation.
 */
import type { Sprint, SprintStatus } from '@/types/agile'
import { sprintStore } from './stores'
import { mockDelay } from './http'

export interface CreateSprintInput {
  projectId: string
  name: string
  goal?: string
  startDate: string
  endDate: string
}

export interface UpdateSprintInput extends Partial<CreateSprintInput> {
  status?: SprintStatus
}


export const sprintRepository = {
  async list(projectId?: string): Promise<Sprint[]> {
    await mockDelay(300)
    return sprintStore.query({ filters: projectId ? { projectId } : undefined, sort: { field: 'endDate', direction: 'desc' } }).items
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

  /** The next planned sprint for a project (virtual "Backlog" if none is scheduled). */
  async backlog(projectId: string): Promise<Sprint> {
    await mockDelay(200)
    const next = sprintStore.find(
      (sprint) => sprint.projectId === projectId && sprint.status === 'planned',
    )
    if (next) return next
    const now = new Date().toISOString()
    return sprintStore.create({
      projectId,
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