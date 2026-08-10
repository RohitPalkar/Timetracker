import { createContext, useContext } from 'react'
import type { Project } from '@/types'
import type { ProjectMemberRecord } from '@/services'
import type { DashboardPersona } from '@/types/dashboard'
import type { ProjectCapability } from '@/config/project-config'

/**
 * Project Workspace context — available to every workspace child screen.
 * Populated by `RequireProjectAccess` after the service has confirmed the
 * actor's scope, so no child screen needs to re-fetch the project.
 */
export interface ProjectWorkspaceContextValue {
  project: Project
  /** The actor's own membership in this project (null when organization-wide). */
  member: ProjectMemberRecord | null
  /** All project members (with resolved users). */
  members: ProjectMemberRecord[]
  persona: DashboardPersona
  actorId: string
  /** Centralized capability check for the current actor. */
  can: (capability: ProjectCapability) => boolean
}

export const ProjectWorkspaceContext = createContext<ProjectWorkspaceContextValue | null>(null)

/** Consume the workspace context — throws when rendered outside the workspace. */
export function useProjectWorkspace(): ProjectWorkspaceContextValue {
  const value = useContext(ProjectWorkspaceContext)
  if (!value) throw new Error('useProjectWorkspace must be used within a project workspace route')
  return value
}
