import { EmptyState } from '@/components/feedback/empty-state'
import { useSubProjectWorkspace } from '../components/sub-project-workspace-context'
import { SUB_PROJECT_WORKSPACE_NAV, type SubProjectWorkspaceNavId } from '@/config/sub-project-workspace-navigation'

/**
 * Shared placeholder for sub-project workspace child screens that ship in
 * later phases. The route is established; the module content is built in its
 * own phase.
 */
export function SubProjectWorkspacePlaceholderPage({ navId }: { navId: SubProjectWorkspaceNavId }) {
  const { subProject } = useSubProjectWorkspace()
  const item = SUB_PROJECT_WORKSPACE_NAV.find((entry) => entry.id === navId)

  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 p-8">
      <EmptyState
        icon={item?.icon}
        title={`${item?.label ?? 'Workspace'} — ${subProject.name}`}
        description={item?.placeholder ?? 'This module will be available here.'}
      />
    </div>
  )
}
