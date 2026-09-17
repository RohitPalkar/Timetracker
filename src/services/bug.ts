/**
 * Bug repository — in-memory mock implementation.
 */
import type { Bug, BugWorkflowStatus } from '@/types/agile'
import type { PageParams, QueryFilter, SortSpec } from '@/types/api'
import { bugStore } from './stores'
import { DEMO_PROJECTS } from '@/mocks/data'
import { mockDelay } from './http'

export interface CreateBugInput {
  projectId: string
  subProjectId?: string
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
  subProjectId?: string
  pageParams?: PageParams
  filters?: QueryFilter
  sort?: SortSpec
  search?: string
}


function nextKey(projectId: string): string {
  const project = DEMO_PROJECTS.find((candidate) => candidate.id === projectId)
  const prefix = project?.key ?? 'PRJ'
  const max = bugStore
    .all()
    .filter((bug) => bug.key.startsWith(`${prefix}-`))
    .reduce((highest, bug) => Math.max(highest, Number(bug.key.split('-')[1]) || 0), 0)
  return `${prefix}-${max + 1}`
}

export const bugRepository = {
  async list(params?: BugListParams): Promise<{ items: Bug[]; total: number }> {
    await mockDelay(300)
    const result = bugStore.query({
      search: params?.search,
      searchFields: ['key', 'title'],
      filters: { ...params?.filters, projectId: params?.projectId, subProjectId: params?.subProjectId },
      sort: params?.sort ?? { field: 'updatedAt', direction: 'desc' },
      pageParams: params?.pageParams,
    })
    return { items: result.items, total: result.total }
  },

  async listByContext(context: { projectId: string; subProjectId?: string }): Promise<{ items: Bug[]; total: number }> {
    await mockDelay(300)
    const result = bugStore.query({
      filters: { projectId: context.projectId },
      match: (bug) => (context.subProjectId ? bug.subProjectId === context.subProjectId : !bug.subProjectId),
      sort: { field: 'updatedAt', direction: 'desc' },
    })
    return { items: result.items, total: result.total }
  },

  async get(key: string): Promise<Bug> {
    await mockDelay(200)
    const bug = bugStore.find((candidate) => candidate.key === key)
    if (!bug) throw new Error('Bug not found')
    return bug
  },

  async create(input: CreateBugInput): Promise<Bug> {
    await mockDelay(400)
    const now = new Date().toISOString()
    return bugStore.create({
      ...input,
      id: undefined as never,
      key: nextKey(input.projectId),
      description: input.description ?? '',
      status: 'open',
      reporterId: 'user-rohit',
      createdAt: now,
      updatedAt: now,
    } as unknown as Bug)
  },

  async update(id: string, input: UpdateBugInput): Promise<Bug> {
    await mockDelay(300)
    const updated = bugStore.update(id, { ...input, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Bug not found')
    return updated
  },

  async transition(id: string, status: BugWorkflowStatus): Promise<Bug> {
    await mockDelay(200)
    const updated = bugStore.update(id, { status, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Bug not found')
    return updated
  },
}