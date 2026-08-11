import { toast } from 'sonner'
import { PageHeader } from '@/components/common/page-header'
import { TeamMembers } from '../components/team-members'
import { useProjectWorkspace } from '../components/project-workspace-context'
import { useProjectMutations, useUserDirectory } from '../project-queries'
import type { ProjectMemberRole } from '@/types'

/**
 * Workspace Teams tab — routed at `/projects/:projectId/teams`. Full team
 * composition, roles and capacity, sourced from the workspace context.
 */
export function ProjectWorkspaceTeamsPage() {
  const { project, members, can } = useProjectWorkspace()
  const { users } = useUserDirectory()
  const mutations = useProjectMutations()
  const canManage = can('projects.edit')

  const handleAdd = (input: { userId: string; role: ProjectMemberRole; capacity: number }) => {
    mutations.addMember.mutate(
      { projectId: project.id, input },
      {
        onSuccess: () => toast.success('Team member added'),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not add member'),
      },
    )
  }

  const handleRemove = (userId: string) => {
    mutations.removeMember.mutate(
      { projectId: project.id, userId },
      {
        onSuccess: () => toast.success('Team member removed'),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not remove member'),
      },
    )
  }

  const handleRoleChange = (userId: string, role: ProjectMemberRole) => {
    mutations.updateMember.mutate(
      { projectId: project.id, userId, patch: { role } },
      {
        onSuccess: () => toast.success('Role updated'),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not update role'),
      },
    )
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <PageHeader title="Teams" description={`Team composition and capacity for "${project.name}".`} />
      <TeamMembers
        members={members}
        users={users}
        canManage={canManage}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onRoleChange={handleRoleChange}
      />
    </div>
  )
}
