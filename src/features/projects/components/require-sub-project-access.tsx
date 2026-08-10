import { useParams } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { ForbiddenState } from './forbidden-state'
import { NotFoundState } from '@/components/feedback/not-found-state'
import { ErrorState } from '@/components/feedback/error-state'
import { ApiError } from '@/services/http'
import { useSubProjectWorkspaceContext } from '../sub-project-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { DEMO_ACTOR_BY_PERSONA, getProjectConfig, hasProjectCapability, type ProjectCapability } from '@/config/project-config'
import { SubProjectWorkspaceContext, type SubProjectWorkspaceContextValue } from './sub-project-workspace-context'

/**
 * Sub Project Workspace access gate — the single enforcement point for
 * `/projects/:projectId/sub-projects/:subProjectId/*`. The service resolves
 * the actor's sub-project membership and only then is sub-project data made
 * available to the workspace. Project-level membership alone is NOT enough.
 *
 *   Loading  → workspace skeleton
 *   404      → NotFoundState (sub-project does not exist)
 *   403      → ForbiddenState (not a member of this sub-project)
 *   Allowed  → workspace context + children
 */
export function RequireSubProjectAccess({ children }: { children: React.ReactNode }) {
  const { projectId, subProjectId } = useParams()
  const { authUser } = useAuth()
  const query = useSubProjectWorkspaceContext(subProjectId)

  if (query.isLoading) return <SubProjectWorkspaceSkeleton />

  if (query.isError) {
    const status = query.error instanceof ApiError ? query.error.status : undefined
    if (status === 403)
      return (
        <ForbiddenState
          title="No access to this sub-project"
          description="This sub-project is outside your permitted scope. Ask the sub-project manager or an administrator to add you."
          backTo={`/projects/${projectId}/sub-projects`}
          backLabel="Back to sub-projects"
        />
      )
    if (status === 404)
      return (
        <NotFoundState
          title="Sub-project not found"
          description="This sub-project does not exist. It may have been removed, or the link may be incorrect."
          backTo="/projects"
          backLabel="Back to projects"
        />
      )
    return (
      <ErrorState
        title="Could not load sub-project"
        description={query.error instanceof Error ? query.error.message : 'Something went wrong.'}
        onRetry={() => query.refetch()}
      />
    )
  }

  if (!query.data) return <SubProjectWorkspaceSkeleton />

  const persona = personaForRole(authUser?.roleId)
  const config = getProjectConfig(persona)
  const can = (capability: ProjectCapability) => hasProjectCapability(config, capability)
  const context: SubProjectWorkspaceContextValue = {
    projectId: query.data.subProject.projectId,
    projectName: query.data.projectName,
    subProject: query.data.subProject,
    member: query.data.member,
    members: query.data.members,
    teams: query.data.teams,
    persona,
    actorId: DEMO_ACTOR_BY_PERSONA[persona],
    can,
  }

  return <SubProjectWorkspaceContext.Provider value={context}>{children}</SubProjectWorkspaceContext.Provider>
}

/** Full-page loading state for the workspace — mirrors its eventual layout. */
export function SubProjectWorkspaceSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5" role="status" aria-label="Loading sub-project workspace">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-[360px] w-full rounded-2xl" />
    </div>
  )
}
