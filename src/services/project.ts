/**
 * Project repository — the single source of truth for the Project module.
 * Backed by the in-memory mock store; the same interface will be reimplemented
 * against a REST API in the integration phase without touching feature code.
 */
import type { Milestone, Project, ProjectActivity, ProjectMember, ProjectMemberRole, ProjectStatus, User } from '@/types'
import type { PageParams, SortSpec } from '@/types/api'
import { projectActivityStore, projectMemberStore, projectStore, milestoneStore, userStore } from './stores'
import { mockDelay } from './http'
import { projectMemberKey } from '@/mocks/data'
import { uid } from '@/lib/utils'

export interface CreateProjectInput {
  name: string
  key?: string
  client?: string
  description?: string
  ownerId: string
  businessAnalystId?: string
  startDate: string
  endDate: string
  budget: number
  status: ProjectStatus
  teamMemberIds?: string[]
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  health?: Project['health']
  progress?: number
  spent?: number
  tags?: string[]
}

export interface ProjectListParams extends PageParams {
  search?: string
  statuses?: ProjectStatus[]
  ownerId?: string
  client?: string
  /** Restrict to projects the given user is a member of. */
  memberId?: string
  /** startDate >= startFrom (ISO date). */
  startFrom?: string
  /** endDate <= endBefore (ISO date). */
  endBefore?: string
  sort?: SortSpec
}

export interface AddMemberInput {
  userId: string
  role: ProjectMemberRole
  capacity: number
}

export interface ProjectMemberRecord extends ProjectMember {
  user: User
}

/** Project row enriched for the list table — manager + team resolved server-side. */
export interface ProjectListItem extends Project {
  managerName: string
  businessAnalystName?: string
  memberCount: number
  memberUsers: Array<{ id: string; name: string; avatarUrl?: string }>
}

export interface ProjectDetail {
  project: Project
  members: ProjectMemberRecord[]
  milestones: Milestone[]
  activity: ProjectActivity[]
}

function resolveUser(userId: string | undefined): User | undefined {
  if (!userId) return undefined
  return userStore.get(userId)
}

function withMembers(projectId: string): ProjectMemberRecord[] {
  return projectMemberStore
    .query({ filters: { projectId } })
    .items.map((member) => ({
      ...member,
      user: resolveUser(member.userId) as User,
    }))
    .filter((member) => Boolean(member.user))
}

function toListItem(project: Project): ProjectListItem {
  const members = projectMemberStore.query({ filters: { projectId: project.id } }).items
  return {
    ...project,
    managerName: resolveUser(project.ownerId)?.name ?? 'Unassigned',
    businessAnalystName: resolveUser(project.businessAnalystId)?.name,
    memberCount: members.length,
    memberUsers: members.map((member) => {
      const user = resolveUser(member.userId)
      return { id: member.userId, name: user?.name ?? 'Unknown', avatarUrl: user?.avatarUrl }
    }),
  }
}

function deriveKey(name: string): string {
  const words = name.split(/[\s-]+/).filter(Boolean)
  const prefix = (words[0]?.slice(0, 3) + (words[1]?.[0] ?? '')).toUpperCase() || 'PRJ'
  const existing = projectStore.all().filter((project) => project.key.startsWith(prefix)).length
  return existing === 0 ? prefix : `${prefix}${existing + 1}`
}

function normalizeKey(key: string | undefined, name: string): string {
  if (key && key.trim()) return key.trim().toUpperCase()
  return deriveKey(name)
}

async function syncMembers(
  projectId: string,
  input: { ownerId?: string; businessAnalystId?: string; teamMemberIds?: string[] },
): Promise<void> {
  const desired = new Set([input.ownerId, input.businessAnalystId, ...(input.teamMemberIds ?? [])].filter(Boolean) as string[])
  const existing = projectMemberStore.query({ filters: { projectId } }).items

  for (const member of existing) {
    if (!desired.has(member.userId)) projectMemberStore.remove(member.id)
  }
  for (const userId of desired) {
    if (!existing.some((member) => member.userId === userId)) {
      projectMemberStore.create({
        id: projectMemberKey(projectId, userId),
        projectId,
        userId,
        role: userId === input.ownerId ? 'manager' : userId === input.businessAnalystId ? 'business_analyst' : 'developer',
        capacity: 80,
        joinedAt: new Date().toISOString(),
      })
    }
  }
}

export const projectService = {
  async list(params?: Partial<ProjectListParams>): Promise<{ items: ProjectListItem[]; total: number }> {
    await mockDelay(320)
    const pageParams = params ? { page: params.page ?? 1, pageSize: params.pageSize ?? 20 } : undefined

    const memberProjectIds = params?.memberId
      ? new Set(
          projectMemberStore
            .query({ filters: { userId: params.memberId } })
            .items.map((item) => item.projectId),
        )
      : null

    const filters: Record<string, string | string[] | undefined> = {}
    if (params?.statuses && params.statuses.length > 0) filters.status = params.statuses
    if (params?.ownerId) filters.ownerId = params.ownerId
    if (params?.client) filters.client = params.client

    const searchAccessors: Array<(row: Project) => string | string[] | undefined> = params?.search
      ? [
          (row) => (resolveUser(row.ownerId)?.name ?? ''),
          (row) => (resolveUser(row.businessAnalystId)?.name ?? ''),
        ]
      : []

    const result = projectStore.query({
      search: params?.search,
      searchFields: ['name', 'key', 'client', 'tags', ...searchAccessors],
      filters,
      match: (project) => {
        if (memberProjectIds && !memberProjectIds.has(project.id)) return false
        if (params?.startFrom && project.startDate < new Date(params.startFrom).toISOString()) return false
        if (params?.endBefore && project.endDate > new Date(params.endBefore).toISOString()) return false
        return true
      },
      sort: params?.sort ?? { field: 'name', direction: 'asc' },
      pageParams,
    })

    return { items: result.items.map(toListItem), total: result.total }
  },

  async get(id: string): Promise<Project> {
    await mockDelay(180)
    const project = projectStore.get(id)
    if (!project) throw new Error('Project not found')
    return project
  },

  async getByKey(key: string): Promise<Project> {
    await mockDelay(180)
    const project = projectStore.find((candidate) => candidate.key.toLowerCase() === key.toLowerCase())
    if (!project) throw new Error('Project not found')
    return project
  },

  /** Aggregate read model for the details page. */
  async detail(id: string): Promise<ProjectDetail> {
    await mockDelay(260)
    const project = projectStore.get(id)
    if (!project) throw new Error('Project not found')
    return {
      project,
      members: withMembers(id),
      milestones: milestoneStore.query({ filters: { projectId: id }, sort: { field: 'date', direction: 'asc' } }).items,
      activity: projectActivityStore
        .query({ filters: { projectId: id } })
        .items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }
  },

  async create(input: CreateProjectInput): Promise<Project> {
    await mockDelay(420)
    const now = new Date().toISOString()
    const project = projectStore.create({
      id: uid('prj'),
      key: normalizeKey(input.key, input.name),
      name: input.name,
      description: input.description ?? '',
      status: input.status ?? 'planned',
      health: 'healthy' as const,
      progress: 0,
      ownerId: input.ownerId,
      businessAnalystId: input.businessAnalystId,
      client: input.client || undefined,
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget ?? 0,
      spent: 0,
      tags: [],
      updatedAt: now,
    })
    await syncMembers(project.id, input)
    projectActivityStore.create({
      id: uid('act'),
      projectId: project.id,
      type: 'settings',
      actorId: input.ownerId,
      action: 'created the project',
      target: project.key,
      createdAt: now,
    })
    return project
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    await mockDelay(300)
    const existing = projectStore.get(id)
    if (!existing) throw new Error('Project not found')
    const updated = projectStore.update(id, {
      ...input,
      key: input.key ? normalizeKey(input.key, existing.name) : existing.key,
      client: input.client === '' ? undefined : input.client,
      updatedAt: new Date().toISOString(),
    })
    if (input.ownerId || input.businessAnalystId || input.teamMemberIds) {
      await syncMembers(id, input)
    }
    return updated as Project
  },

  async archive(id: string): Promise<void> {
    await mockDelay(240)
    projectStore.update(id, { status: 'archived', updatedAt: new Date().toISOString() })
  },

  async bulkArchive(ids: string[]): Promise<number> {
    await mockDelay(360)
    let archived = 0
    for (const id of ids) {
      const updated = projectStore.update(id, { status: 'archived', updatedAt: new Date().toISOString() })
      if (updated) archived += 1
    }
    return archived
  },

  async bulkRemove(ids: string[]): Promise<number> {
    await mockDelay(360)
    let removed = 0
    for (const id of ids) {
      if (projectStore.remove(id)) removed += 1
    }
    return removed
  },

  async members(projectId: string): Promise<ProjectMemberRecord[]> {
    await mockDelay(220)
    return withMembers(projectId)
  },

  async addMember(projectId: string, input: AddMemberInput): Promise<ProjectMemberRecord[]> {
    await mockDelay(260)
    const key = projectMemberKey(projectId, input.userId)
    const existing = projectMemberStore.get(key)
    if (existing) {
      projectMemberStore.update(key, { role: input.role, capacity: input.capacity })
    } else {
      projectMemberStore.create({
        id: key,
        projectId,
        userId: input.userId,
        role: input.role,
        capacity: input.capacity,
        joinedAt: new Date().toISOString(),
      })
    }
    const actor = resolveUser(input.userId)
    projectActivityStore.create({
      id: uid('act'),
      projectId,
      type: 'member',
      actorId: input.userId,
      action: 'joined the project',
      target: actor?.name ?? 'New member',
      createdAt: new Date().toISOString(),
    })
    return withMembers(projectId)
  },

  async updateMember(projectId: string, userId: string, patch: Partial<Pick<ProjectMember, 'role' | 'capacity'>>): Promise<ProjectMemberRecord[]> {
    await mockDelay(220)
    projectMemberStore.update(projectMemberKey(projectId, userId), patch)
    return withMembers(projectId)
  },

  async removeMember(projectId: string, userId: string): Promise<ProjectMemberRecord[]> {
    await mockDelay(220)
    projectMemberStore.remove(projectMemberKey(projectId, userId))
    return withMembers(projectId)
  },

  async milestones(projectId: string): Promise<Milestone[]> {
    await mockDelay(200)
    return milestoneStore.query({ filters: { projectId }, sort: { field: 'date', direction: 'asc' } }).items
  },

  async activity(projectId: string): Promise<ProjectActivity[]> {
    await mockDelay(200)
    return projectActivityStore
      .query({ filters: { projectId } })
      .items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
}