import { useParams } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { ForbiddenState } from './forbidden-state'
import { NotFoundState } from '@/components/feedback/not-found-state'
import { ErrorState } from '@/components/feedback/error-state'
import { ApiError } from '@/services/http'
import { useWorkspaceContext } from '../project-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { DEMO_ACTOR_BY_PERSONA, getProjectConfig, hasProjectCapability, type ProjectCapability } from '@/config/project-config'
import { ProjectWorkspaceContext, type ProjectWorkspaceContextValue } from './project-workspace-context'

/**
 * Project Workspace access gate — the single enforcement point for
 * `/projects/:projectId/*`. The service resolves the actor's scope and only
 * then is project data made available to the workspace:
 *
 *   Loading  → workspace skeleton
 *   404      → NotFoundState (project does not exist)
 *   403      → ForbiddenState (out of the actor's permitted scope)
 *   Allowed  → workspace context + children
 */
export function RequireProjectAccess({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams()
  const { authUser } = useAuth()
  const query = useWorkspaceContext(projectId)

  if (query.isLoading) return <ProjectWorkspaceSkeleton />

  if (query.isError) {
    const status = query.error instanceof ApiError ? query.error.status : undefined
    if (status === 403)
      return (
        <ForbiddenState
          title="No access to this project"
          description="This project is outside your permitted scope. Ask the project manager or an administrator to add you."
        />
      )
    if (status === 404) return <NotFoundState title="Project not found" description="This project does not exist. It may have been removed, or the link may be incorrect." backTo="/projects" backLabel="Back to projects" />
    return (
      <ErrorState
        title="Could not load project"
        description={query.error instanceof Error ? query.error.message : 'Something went wrong.'}
        onRetry={() => query.refetch()}
      />
    )
  }

  if (!query.data) return <ProjectWorkspaceSkeleton />

  const persona = personaForRole(authUser?.roleId)
  const config = getProjectConfig(persona)
  const can = (capability: ProjectCapability) => hasProjectCapability(config, capability)
  const context: ProjectWorkspaceContextValue = {
    project: query.data.project,
    member: query.data.member,
    members: query.data.members,
    subProjects: query.data.subProjects,
    teams: query.data.teams,
    persona,
    actorId: DEMO_ACTOR_BY_PERSONA[persona],
    can,
  }

  return <ProjectWorkspaceContext.Provider value={context}>{children}</ProjectWorkspaceContext.Provider>
}

/** Full-page loading state for the workspace — mirrors its eventual layout. */
export function ProjectWorkspaceSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5" role="status" aria-label="Loading project workspace">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-[360px] w-full rounded-2xl" />
    </div>
  )
}
