/**
 * Sprint service — architecture only for Phase 1.
 * Implemented in Phase 4 (Sprints).
 */
import type { Sprint, SprintStatus } from '@/types/agile'
import { notImplemented } from './http'

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

export const sprintService = {
  async list(_projectId?: string): Promise<Sprint[]> {
    return notImplemented('Sprint')
  },
  async get(_id: string): Promise<Sprint> {
    return notImplemented('Sprint')
  },
  async create(_input: CreateSprintInput): Promise<Sprint> {
    return notImplemented('Sprint')
  },
  async update(_id: string, _input: UpdateSprintInput): Promise<Sprint> {
    return notImplemented('Sprint')
  },
  async start(_id: string): Promise<Sprint> {
    return notImplemented('Sprint')
  },
  async complete(_id: string): Promise<Sprint> {
    return notImplemented('Sprint')
  },
  async backlog(_projectId: string): Promise<Sprint> {
    return notImplemented('Sprint')
  },
}