import { useQuery } from '@tanstack/react-query'
import { epicRepository, releaseRepository, sprintRepository, userService } from '@/services'
import { projectService } from '@/services'
import { MAX_LIST_PAGE_SIZE } from '@/constants'

export const planningKeys = {
  all: ['planning'] as const,
  projects: ['planning', 'projects'] as const,
  sprints: (projectId: string | null) => ['planning', 'sprints', projectId] as const,
  epics: (projectId: string | null) => ['planning', 'epics', projectId] as const,
  releases: (projectId: string | null) => ['planning', 'releases', projectId] as const,
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
