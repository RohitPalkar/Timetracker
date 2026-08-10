import * as React from 'react'
import { useLocation } from 'react-router'
import { toast } from 'sonner'
import { Breadcrumb } from '@/components/navigation/breadcrumb'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ProjectWorkspaceHeader } from './project-workspace-header'
import { ProjectWorkspaceNav } from './project-workspace-nav'
import { ProjectFormDrawer } from './project-form-drawer'
import { useProjectWorkspace } from './project-workspace-context'
import { useProjectMutations, useUserDirectory } from '../project-queries'
import { rosterMemberIds } from '../project-form-utils'
import { findWorkspaceNavItem, getVisibleWorkspaceNav } from '@/config/project-workspace-navigation'

/**
 * Project Workspace shell (LEVEL 2 navigation). Provides the shared project
 * context header, workspace navigation and breadcrumb around the routed child
 * screens. Never duplicates the global sidebar — this is project-scoped.
 */
export function ProjectWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { project, members, can } = useProjectWorkspace()
  const { pathname } = useLocation()
  const { users } = useUserDirectory()
  const mutations = useProjectMutations()

  const [editOpen, setEditOpen] = React.useState(false)
  const [confirmArchive, setConfirmArchive] = React.useState(false)

  const managerName = React.useMemo(
    () => users.find((user) => user.id === project.ownerId)?.name ?? 'Unassigned',
    [users, project.ownerId],
  )

  const activeItem = findWorkspaceNavItem(project.id, pathname, getVisibleWorkspaceNav(can))

  const handleArchive = () => {
    mutations.archive.mutate(project.id, {
      onSuccess: () => {
        toast.success(`Project "${project.name}" archived`)
        setConfirmArchive(false)
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not archive project'),
    })
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Breadcrumb
        items={[
          { label: 'Projects', to: '/projects' },
          { label: project.name, to: `/projects/${project.id}/overview` },
          ...(activeItem ? [{ label: activeItem.label }] : []),
        ]}
      />

      <ProjectWorkspaceHeader managerName={managerName} onEdit={() => setEditOpen(true)} onArchive={() => setConfirmArchive(true)} />

      <ProjectWorkspaceNav />

      <div className="min-h-[420px]">{children}</div>

      <ProjectFormDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        memberUserIds={rosterMemberIds(members)}
        users={users}
      />

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title="Archive project?"
        description={`"${project.name}" will be archived and hidden from active views.`}
        confirmLabel="Archive"
        loading={mutations.archive.isPending}
        onConfirm={handleArchive}
      />
    </div>
  )
}
