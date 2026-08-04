import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bugRepository, epicRepository, releaseRepository, sprintRepository, storyRepository, userService } from '@/services'
import { projectService } from '@/services'
import { MAX_LIST_PAGE_SIZE } from '@/constants'
import type { PlanningFilters } from '@/store/planning'

export const planningKeys = {
  all: ['planning'] as const,
  projects: ['planning', 'projects'] as const,
  sprints: (projectId: string | null) => ['planning', 'sprints', projectId] as const,
  epics: (projectId: string | null) => ['planning', 'epics', projectId] as const,
  releases: (projectId: string | null) => ['planning', 'releases', projectId] as const,
  stories: (projectId: string | null, extra?: Record<string, unknown>) =>
    ['planning', 'stories', projectId, extra] as const,
  bugs: (projectId: string | null, params?: Record<string, unknown>) =>
    ['planning', 'bugs', projectId, params] as const,
  users: ['planning', 'users'] as const,
}

export function usePlanningProjects() {
  return useQuery({
    queryKey: planningKeys.projects,
    queryFn: async () => {
      const result = await projectService.list({ page: 1, pageSize: MAX_LIST_PAGE_SIZE })
      return result.items
    },
  })
}

export function usePlanningSprints(projectId: string | null) {
  return useQuery({
    queryKey: planningKeys.sprints(projectId),
    queryFn: () => sprintRepository.list(projectId ?? undefined),
    enabled: Boolean(projectId),
  })
}

export function usePlanningEpics(projectId: string | null) {
  return useQuery({
    queryKey: planningKeys.epics(projectId),
    queryFn: async () => {
      const result = await epicRepository.list({
        projectId: projectId ?? undefined,
        pageParams: { page: 1, pageSize: MAX_LIST_PAGE_SIZE },
      })
      return result.items
    },
    enabled: Boolean(projectId),
  })
}

export function usePlanningReleases(projectId: string | null) {
  return useQuery({
    queryKey: planningKeys.releases(projectId),
    queryFn: async () => {
      const result = await releaseRepository.list({
        projectId: projectId ?? undefined,
        pageParams: { page: 1, pageSize: MAX_LIST_PAGE_SIZE },
      })
      return result.items
    },
    enabled: Boolean(projectId),
  })
}

export function usePlanningUsers() {
  return useQuery({
    queryKey: planningKeys.users,
    queryFn: async () => {
      const result = await userService.list({ page: 1, pageSize: MAX_LIST_PAGE_SIZE })
      return result.items
    },
  })
}

/** Backlog stories — stories not assigned to a sprint for the given project. */
export function usePlanningBacklog(
  projectId: string | null,
  params?: { search?: string; filters?: PlanningFilters },
) {
  return useQuery({
    queryKey: planningKeys.stories(projectId, { backlog: true, ...params }),
    queryFn: () =>
      storyRepository.list({
        projectId: projectId ?? undefined,
        backlogOnly: true,
        search: params?.search,
        filters: params?.filters as Record<string, string | undefined>,
        sort: { field: 'updatedAt', direction: 'desc' },
      }),
    enabled: Boolean(projectId),
  })
}

/** All stories for a project (board, list views). */
export function usePlanningStories(
  projectId: string | null,
  params?: { sprintId?: string; search?: string; filters?: PlanningFilters },
) {
  return useQuery({
    queryKey: planningKeys.stories(projectId, params ?? {}),
    queryFn: () =>
      storyRepository.list({
        projectId: projectId ?? undefined,
        sprintId: params?.sprintId,
        search: params?.search,
        filters: params?.filters as Record<string, string | undefined>,
        sort: { field: 'updatedAt', direction: 'desc' },
      }),
    enabled: Boolean(projectId),
  })
}

/** Story mutations with automatic cache invalidation. */
export function useStoryMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: planningKeys.all })

  const create = useMutation({
    mutationFn: storyRepository.create,
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof storyRepository.update>[1] }) =>
      storyRepository.update(id, input),
    onSuccess: invalidate,
  })
  const move = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof storyRepository.move>[1] }) =>
      storyRepository.move(id, status),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: storyRepository.remove,
    onSuccess: invalidate,
  })

  return { create, update, move, remove }
}

/** Sprint mutations with automatic cache invalidation. */
export function useSprintMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: planningKeys.all })

  const create = useMutation({
    mutationFn: sprintRepository.create,
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof sprintRepository.update>[1] }) =>
      sprintRepository.update(id, input),
    onSuccess: invalidate,
  })

  return { create, update }
}

/** Bugs for a project. */
export function usePlanningBugs(
  projectId: string | null,
  params?: { search?: string; filters?: PlanningFilters },
) {
  return useQuery({
    queryKey: planningKeys.bugs(projectId, params ?? {}),
    queryFn: () =>
      bugRepository.list({
        projectId: projectId ?? undefined,
        search: params?.search,
        filters: params?.filters as Record<string, string | undefined>,
        sort: { field: 'updatedAt', direction: 'desc' },
      }),
    enabled: Boolean(projectId),
  })
}

/** Bug mutations with automatic cache invalidation. */
export function useBugMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: planningKeys.all })

  const create = useMutation({
    mutationFn: bugRepository.create,
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof bugRepository.update>[1] }) =>
      bugRepository.update(id, input),
    onSuccess: invalidate,
  })

  return { create, update }
}
