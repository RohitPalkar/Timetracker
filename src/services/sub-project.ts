/**
 * Sub-project repository — manages delivery units inside a parent project.
 * Access is scoped to sub-project memberships: holding a project-level
 * membership alone does NOT grant access to a sub-project.
 */
import type { ProjectMembership, ProjectScope, SubProject, Team, User } from '@/types'
import { projectMembershipStore, projectStore, subProjectStore, teamStore, userStore } from './stores'
import { ApiError, mockDelay } from './http'

export interface SubProjectMemberRecord extends ProjectMembership {
  user: User
}

export interface SubProjectDetail {
  subProject: SubProject
  projectName: string
  members: SubProjectMemberRecord[]
  teams: Team[]
}

function resolveUser(userId: string | undefined): User | undefined {
  if (!userId) return undefined
  return userStore.get(userId)
}

function withMembers(subProjectId: string): SubProjectMemberRecord[] {
  return projectMembershipStore
    .query({ filters: { subProjectId }, sort: { field: 'startedAt', direction: 'asc' } })
    .items.map((membership) => ({ ...membership, user: resolveUser(membership.userId) as User }))
    .filter((membership) => Boolean(membership.user))
}

function withTeams(subProject: SubProject): Team[] {
  return teamStore
    .all()
    .filter((team) => team.projectId === subProject.projectId && team.subProjectIds.includes(subProject.id))
}

export const subProjectService = {
  async list(projectId: string): Promise<SubProject[]> {
    await mockDelay(220)
    return subProjectStore.query({ filters: { projectId }, sort: { field: 'name', direction: 'asc' } }).items
  },

  async get(id: string): Promise<SubProject> {
    await mockDelay(180)
    const subProject = subProjectStore.get(id)
    if (!subProject) throw new ApiError('This sub-project does not exist.', 404, 'SUB_PROJECT_NOT_FOUND')
    return subProject
  },

  async getByKey(projectId: string, key: string): Promise<SubProject> {
    await mockDelay(180)
    const subProject = subProjectStore.find(
      (candidate) => candidate.projectId === projectId && candidate.key.toLowerCase() === key.toLowerCase(),
    )
    if (!subProject) throw new ApiError('This sub-project does not exist.', 404, 'SUB_PROJECT_NOT_FOUND')
    return subProject
  },

  /**
   * Access-aware workspace context for a single sub-project. Enforces
   * sub-project membership: organization personas may open any sub-project;
   * everyone else must hold a membership scoped to that sub-project.
   * Throws ApiError(404) when the sub-project does not exist and ApiError(403)
   * when the actor is out of scope.
   */
  async getWorkspaceContext(
    subProjectId: string,
    actor: { userId: string; scope: ProjectScope },
  ): Promise<SubProjectDetail & { member: SubProjectMemberRecord | null }> {
    await mockDelay(240)
    const subProject = subProjectStore.get(subProjectId)
    if (!subProject) throw new ApiError('This sub-project does not exist.', 404, 'SUB_PROJECT_NOT_FOUND')

    const membership =
      projectMembershipStore.query({ filters: { subProjectId, userId: actor.userId } }).items[0] ?? null
    const allowed = actor.scope === 'organization' || membership !== null
    if (!allowed) throw new ApiError('You do not have access to this sub-project.', 403, 'SUB_PROJECT_FORBIDDEN')

    const member = membership ? ({ ...membership, user: resolveUser(membership.userId) as User } as SubProjectMemberRecord) : null
    return {
      subProject,
      projectName: projectStore.get(subProject.projectId)?.name ?? 'Unknown project',
      member,
      members: withMembers(subProjectId),
      teams: withTeams(subProject),
    }
  },

  async detail(subProjectId: string): Promise<SubProjectDetail> {
    await mockDelay(240)
    const subProject = subProjectStore.get(subProjectId)
    if (!subProject) throw new ApiError('This sub-project does not exist.', 404, 'SUB_PROJECT_NOT_FOUND')
    return {
      subProject,
      projectName: projectStore.get(subProject.projectId)?.name ?? 'Unknown project',
      members: withMembers(subProjectId),
      teams: withTeams(subProject),
    }
  },

  async members(subProjectId: string): Promise<SubProjectMemberRecord[]> {
    await mockDelay(220)
    return withMembers(subProjectId)
  },
}
