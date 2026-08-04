/**
 * Project repository — backed by the in-memory mock store.
 * Same interface will be reimplemented against a REST API in the integration phase.
 */
import type { Project, ProjectMember } from '@/types'
import type { PageParams, QueryFilter, SortSpec } from '@/types/api'
import { projectMemberStore, projectStore } from './stores'
import { mockDelay } from './http'

export interface CreateProjectInput {
  name: string
  key?: string
  description?: string
  ownerId?: string
  startDate?: string
  endDate?: string
  client?: string
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  status?: Project['status']
  health?: Project['health']
  budget?: number
}

export interface ProjectListParams extends PageParams {
  filters?: QueryFilter
  sort?: SortSpec
  search?: string
}


function deriveKey(name: string): string {
  const words = name.split(/[\s-]+/).filter(Boolean)
  const prefix = (words[0]?.slice(0, 3) + (words[1]?.[0] ?? '')).toUpperCase() || 'PRJ'
  const existing = projectStore.all().filter((project) => project.key.startsWith(prefix)).length
  return existing === 0 ? prefix : `${prefix}${existing + 1}`
}

export const projectService = {
  async list(params?: Partial<ProjectListParams>): Promise<{ items: Project[]; total: number }> {
    await mockDelay(350)
    const result = projectStore.query({
      search: params?.search,
      searchFields: ['name', 'key', 'client', 'tags'],
      filters: params?.filters,
      sort: params?.sort ?? { field: 'name', direction: 'asc' },
      pageParams: params ? { page: params.page ?? 1, pageSize: params.pageSize ?? 20 } : undefined,
    })
    return { items: result.items, total: result.total }
  },

  async get(id: string): Promise<Project> {
    await mockDelay(200)
    const project = projectStore.get(id)
    if (!project) throw new Error('Project not found')
    return project
  },

  async create(input: CreateProjectInput): Promise<Project> {
    await mockDelay(400)
    return projectStore.create({
      ...input,
      key: input.key ?? deriveKey(input.name),
      description: input.description ?? '',
      status: 'planned',
      health: 'healthy',
      progress: 0,
      ownerId: input.ownerId ?? 'user-rohit',
      budget: 0,
      spent: 0,
      tags: [],
      startDate: input.startDate ?? new Date().toISOString(),
      endDate: input.endDate ?? new Date().toISOString(),
    } as unknown as Project)
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    await mockDelay(300)
    const updated = projectStore.update(id, input)
    if (!updated) throw new Error('Project not found')
    return updated
  },

  async archive(id: string): Promise<void> {
    await mockDelay(250)
    projectStore.update(id, { status: 'archived' })
  },

  async members(projectId: string): Promise<ProjectMember[]> {
    await mockDelay(250)
    return projectMemberStore.query({ filters: { projectId } }).items
  },
}