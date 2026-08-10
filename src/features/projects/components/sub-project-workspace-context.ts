import { createContext, useContext } from 'react'
import type { SubProject, Team } from '@/types'
import type { SubProjectMemberRecord } from '@/services'
import type { DashboardPersona } from '@/types/dashboard'
import type { ProjectCapability } from '@/config/project-config'

/**
 * Sub Project Workspace context — available to every sub-project workspace
 * child screen. Populated by `RequireSubProjectAccess` after the service has
 * confirmed the actor's sub-project membership, so no child screen needs to
 * re-fetch the sub-project.
 */
export interface SubProjectWorkspaceContextValue {
  projectId: string
  projectName: string
  subProject: SubProject
  /** The actor's own membership in this sub-project (null when organization-wide). */
  member: SubProjectMemberRecord | null
  /** All sub-project members (with resolved users). */
  members: SubProjectMemberRecord[]
  /** Delivery teams assigned to this sub-project. */
  teams: Team[]
  persona: DashboardPersona
  actorId: string
  /** Centralized capability check for the current actor. */
  can: (capability: ProjectCapability) => boolean
}

export const SubProjectWorkspaceContext = createContext<SubProjectWorkspaceContextValue | null>(null)

/** Consume the workspace context — throws when rendered outside the workspace. */
export function useSubProjectWorkspace(): SubProjectWorkspaceContextValue {
  const value = useContext(SubProjectWorkspaceContext)
  if (!value) throw new Error('useSubProjectWorkspace must be used within a sub-project workspace route')
  return value
}
