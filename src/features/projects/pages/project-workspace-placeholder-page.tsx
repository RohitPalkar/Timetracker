import { EmptyState } from '@/components/feedback/empty-state'
import { useProjectWorkspace } from '../components/project-workspace-context'
import { PROJECT_WORKSPACE_NAV, type ProjectWorkspaceNavId } from '@/config/project-workspace-navigation'

/**
 * Shared placeholder for workspace child screens that ship in later phases.
 * The route is established; the module content is built in its own phase.
 */
export function ProjectWorkspacePlaceholderPage({ navId }: { navId: ProjectWorkspaceNavId }) {
  const { project } = useProjectWorkspace()
  const item = PROJECT_WORKSPACE_NAV.find((entry) => entry.id === navId)

  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 p-8">
      <EmptyState
        icon={item?.icon}
        title={`${item?.label ?? 'Workspace'} — ${project.name}`}
        description={item?.placeholder ?? 'This module will be available here.'}
      />
    </div>
  )
}
