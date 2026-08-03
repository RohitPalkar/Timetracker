/**
 * Bug service — architecture only for Phase 1.
 * Implemented in Phase 4 (Bugs).
 */
import type { Bug, BugWorkflowStatus } from '@/types/agile'
import type { PageParams, QueryFilter, SortSpec } from '@/types/api'
import { notImplemented } from './http'

export interface CreateBugInput {
  projectId: string
  title: string
  description?: string
  severity: Bug['severity']
  storyId?: string
  assigneeId?: string
}

export interface UpdateBugInput extends Partial<CreateBugInput> {
  status?: BugWorkflowStatus
}

export interface BugListParams {
  projectId?: string
  pageParams?: PageParams
  filters?: QueryFilter
  sort?: SortSpec
  search?: string
}

export const bugService = {
  async list(_params?: BugListParams): Promise<{ items: Bug[]; total: number }> {
    return notImplemented('Bug')
  },
  async get(_key: string): Promise<Bug> {
    return notImplemented('Bug')
  },
  async create(_input: CreateBugInput): Promise<Bug> {
    return notImplemented('Bug')
  },
  async update(_id: string, _input: UpdateBugInput): Promise<Bug> {
    return notImplemented('Bug')
  },
  async transition(_id: string, _status: BugWorkflowStatus): Promise<Bug> {
    return notImplemented('Bug')
  },
}