import type { ReactNode } from 'react'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { getProjectConfig, hasProjectCapability } from '@/config/project-config'
import { ForbiddenState } from './forbidden-state'

/**
 * Route guard for the create-project entry point. Renders a forbidden state
 * for users without the centralized `projects.create` capability instead of
 * silently redirecting — the caller decides what to do next.
 */
export function RequireProjectCreate({ children }: { children: ReactNode }) {
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const config = getProjectConfig(persona)
  if (!hasProjectCapability(config, 'projects.create')) return <ForbiddenState />
  return <>{children}</>
}
