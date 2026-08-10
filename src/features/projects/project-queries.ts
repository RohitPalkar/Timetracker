import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectService, userService, type ProjectListParams, type ProjectMemberRecord } from '@/services'
import { MAX_LIST_PAGE_SIZE } from '@/constants'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { DEMO_ACTOR_BY_PERSONA, getProjectConfig } from '@/config/project-config'
import type { ProjectMemberRole, User } from '@/types'

/** Query key factory — mirrors the REST endpoint hierarchy for the API phase. */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params: object) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

export type ProjectListFilter = Omit<ProjectListParams, 'page' | 'pageSize'>

const LIST_QUERY: ProjectListParams = { page: 1, pageSize: MAX_LIST_PAGE_SIZE }

/** Projects for the list page. Pass filter params to refetch server-side. */
export function useProjects(filter: ProjectListFilter = {}) {
  return useQuery({
    queryKey: projectKeys.list({ ...LIST_QUERY, ...filter }),
    queryFn: () => projectService.list({ ...LIST_QUERY, ...filter }),
  })
}

/** Aggregate read model for the details page. */
export function useProjectDetail(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? 'none'),
    queryFn: () => projectService.detail(projectId as string),
    enabled: Boolean(projectId),
  })
}

/** Users who may act as a project manager — consumed by the create/edit form. */
export function useEligibleProjectManagers(): { managers: User[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: [...projectKeys.all, 'eligible-managers'],
    queryFn: () => projectService.getEligibleProjectManagers(),
  })
  return { managers: query.data ?? [], isLoading: query.isLoading }
}

/**
 * Resolve the current actor (persona → seeded demo actor) the same way the
 * Projects List does. Services enforce scope from `scope` + `actorId`, so the
 * UI can never widen its own data scope.
 */
export function useProjectActor() {
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const config = getProjectConfig(persona)
  return { persona, actorId: DEMO_ACTOR_BY_PERSONA[persona], scope: config.scope }
}

/**
 * Access-aware Project Workspace context. Resolves the actor the same way the
 * Projects List does (persona → seeded demo actor) and lets the service
 * enforce scope — 404 / 403 are surfaced as ApiError statuses.
 */
export function useWorkspaceContext(projectId: string | undefined) {
  const actor = useProjectActor()
  return useQuery({
    queryKey: [...projectKeys.all, 'workspace', projectId ?? 'none'],
    queryFn: () => projectService.getWorkspaceContext(projectId as string, { userId: actor.actorId, scope: actor.scope }),
    enabled: Boolean(projectId),
  })
}

/** Delivery teams on a project (used by the Teams screen and structure-aware nav). */
export function useProjectTeams(projectId: string | undefined) {
  return useQuery({
    queryKey: [...projectKeys.all, 'teams', projectId ?? 'none'],
    queryFn: () => projectService.getTeams(projectId as string),
    enabled: Boolean(projectId),
  })
}

/** All project mutations with automatic list + detail invalidation. */
export function useProjectMutations() {
  const queryClient = useQueryClient()

  const invalidate = (ids: string[]) => {
    queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    for (const id of ids) queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) })
  }

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    queryClient.invalidateQueries({ queryKey: projectKeys.details() })
  }

  const create = useMutation({
    mutationFn: projectService.create,
    onSuccess: () => invalidate([]),
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof projectService.update>[1] }) =>
      projectService.update(id, input),
    onSuccess: (_result, variables) => invalidate([variables.id]),
  })

  const archive = useMutation({
    mutationFn: projectService.archive,
    onSuccess: (_result, id) => invalidate([id]),
  })

  const bulkArchive = useMutation({
    mutationFn: projectService.bulkArchive,
    onSuccess: () => invalidateAll(),
  })

  const bulkRemove = useMutation({
    mutationFn: projectService.bulkRemove,
    onSuccess: () => invalidateAll(),
  })

  const addMember = useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: { userId: string; role: ProjectMemberRole; capacity: number } }) =>
      projectService.addMember(projectId, input),
    onSuccess: (_result, variables) => invalidate([variables.projectId]),
  })

  const removeMember = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) => projectService.removeMember(projectId, userId),
    onSuccess: (_result, variables) => invalidate([variables.projectId]),
  })

  const updateMember = useMutation({
    mutationFn: ({
      projectId,
      userId,
      patch,
    }: {
      projectId: string
      userId: string
      patch: Partial<Pick<ProjectMemberRecord, 'role' | 'capacity'>>
    }) => projectService.updateMember(projectId, userId, patch),
    onSuccess: (_result, variables) => invalidate([variables.projectId]),
  })

  return { create, update, archive, bulkArchive, bulkRemove, addMember, removeMember, updateMember }
}

/** Directory of users usable as form/filter options. */
export function useUserDirectory(): { users: User[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: ['users', 'directory'],
    queryFn: async () => (await userService.list({ page: 1, pageSize: MAX_LIST_PAGE_SIZE })).items,
  })
  return { users: query.data ?? [], isLoading: query.isLoading }
}
