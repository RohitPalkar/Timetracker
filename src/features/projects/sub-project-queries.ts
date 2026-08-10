import { useQuery } from '@tanstack/react-query'
import { subProjectService, teamService } from '@/services'
import { useProjectActor } from './project-queries'

/** Query key factory — mirrors the REST endpoint hierarchy for the API phase. */
export const subProjectKeys = {
  all: ['sub-projects'] as const,
  lists: () => [...subProjectKeys.all, 'list'] as const,
  list: (projectId: string) => [...subProjectKeys.lists(), projectId] as const,
  workspace: (id: string) => [...subProjectKeys.all, 'workspace', id] as const,
  members: (id: string) => [...subProjectKeys.all, 'members', id] as const,
  teams: (id: string) => [...subProjectKeys.all, 'teams', id] as const,
}

/** Sub Projects of a project (drives the Sub Projects screen and list routing). */
export function useSubProjects(projectId: string | undefined) {
  return useQuery({
    queryKey: subProjectKeys.list(projectId ?? 'none'),
    queryFn: () => subProjectService.list(projectId as string),
    enabled: Boolean(projectId),
  })
}

/**
 * Access-aware Sub Project Workspace context. The service enforces sub-project
 * membership (project-level membership alone is NOT sufficient) — 404 / 403 are
 * surfaced as ApiError statuses.
 */
export function useSubProjectWorkspaceContext(subProjectId: string | undefined) {
  const actor = useProjectActor()
  return useQuery({
    queryKey: subProjectKeys.workspace(subProjectId ?? 'none'),
    queryFn: () =>
      subProjectService.getWorkspaceContext(subProjectId as string, { userId: actor.actorId, scope: actor.scope }),
    enabled: Boolean(subProjectId),
  })
}

/** Members of a Sub Project, resolved with their user records. */
export function useSubProjectMembers(subProjectId: string | undefined) {
  return useQuery({
    queryKey: subProjectKeys.members(subProjectId ?? 'none'),
    queryFn: () => subProjectService.members(subProjectId as string),
    enabled: Boolean(subProjectId),
  })
}

/** Delivery teams assigned to a Sub Project. */
export function useSubProjectTeams(subProjectId: string | undefined) {
  return useQuery({
    queryKey: subProjectKeys.teams(subProjectId ?? 'none'),
    queryFn: () => teamService.getBySubProject(subProjectId as string),
    enabled: Boolean(subProjectId),
  })
}
