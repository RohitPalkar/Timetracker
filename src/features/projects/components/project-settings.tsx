import * as React from 'react'
import { Archive, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProjectStatusBadge } from '@/components/common/status-badge'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { toast } from 'sonner'
import { ProjectForm } from './project-form'
import { useProjectMutations } from '../project-queries'
import { PROJECT_STATUS_OPTIONS } from '../project-form-schema'
import { projectToFormValues, rosterMemberIds } from '../project-form-utils'
import type { Project, User } from '@/types'
import type { ProjectMemberRecord } from '@/services'

export interface ProjectSettingsProps {
  project: Project
  members: ProjectMemberRecord[]
  users: User[]
  /** Called after the project is deleted so the page can navigate away. */
  onDeleted: () => void
}

/** Settings tab — basic info, status, archive and danger zone. */
export function ProjectSettings({ project, members, users, onDeleted }: ProjectSettingsProps) {
  const mutations = useProjectMutations()
  const [status, setStatus] = React.useState<Project['status']>(project.status)
  const [confirm, setConfirm] = React.useState<{ type: 'archive' | 'delete' } | null>(null)
  const [dirtyCount, setDirtyCount] = React.useState(0)

  const statusChanged = status !== project.status

  const saveStatus = () => {
    mutations.update.mutate(
      { id: project.id, input: { status } },
      {
        onSuccess: () => toast.success(`Project status updated to "${status.replace('_', ' ')}"`),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not update status'),
      },
    )
  }

  const handleDelete = () => {
    mutations.bulkRemove.mutate(
      [project.id],
      {
        onSuccess: () => {
          toast.success(`Project "${project.name}" deleted`)
          onDeleted()
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not delete project'),
      },
    )
  }

  const handleArchive = () => {
    mutations.archive.mutate(project.id, {
      onSuccess: () => toast.success(`Project "${project.name}" archived`),
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not archive project'),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Basic information</CardTitle>
          <CardDescription>Project identity, ownership, dates and budget.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            key={`${project.id}-${dirtyCount}`}
            defaultValues={projectToFormValues(project, rosterMemberIds(members))}
            users={users}
            submitLabel="Save changes"
            submitting={mutations.update.isPending}
            onSubmit={(values) => {
              mutations.update.mutate(
                {
                  id: project.id,
                  input: {
                    name: values.name,
                    key: values.key === '' ? undefined : values.key,
                    client: values.client === '' ? undefined : values.client,
                    type: values.type,
                    description: values.description,
                    ownerId: values.ownerId,
                    businessAnalystId: values.businessAnalystId === '' ? undefined : values.businessAnalystId,
                    startDate: values.startDate,
                    endDate: values.endDate,
                    budget: values.budget,
                    status: values.status,
                    teamMemberIds: values.teamMemberIds,
                  },
                },
                {
                  onSuccess: () => {
                    toast.success('Project details saved')
                    setDirtyCount((count) => count + 1)
                  },
                  onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not save changes'),
                },
              )
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Project status</CardTitle>
          <CardDescription>Change the delivery state of this project.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <ProjectStatusBadge status={project.status} />
          <Select value={status} onValueChange={(value) => setStatus(value as Project['status'])}>
            <SelectTrigger className="w-44" aria-label="Project status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={saveStatus} disabled={!statusChanged} loading={mutations.update.isPending}>
            Save status
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Archive project</CardTitle>
          <CardDescription>Archived projects are hidden from active views but preserved.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setConfirm({ type: 'archive' })}>
            <Archive aria-hidden="true" /> Archive project
          </Button>
        </CardContent>
      </Card>

      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-danger">Danger zone</CardTitle>
          <CardDescription>Permanently delete this project and all of its data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setConfirm({ type: 'delete' })}>
            <Trash2 aria-hidden="true" /> Delete project
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.type === 'archive' ? 'Archive project?' : 'Delete project?'}
        description={
          confirm?.type === 'archive'
            ? `"${project.name}" will be archived and hidden from active views.`
            : `"${project.name}" and all of its data will be permanently deleted. This cannot be undone.`
        }
        confirmLabel={confirm?.type === 'archive' ? 'Archive' : 'Delete'}
        destructive={confirm?.type === 'delete'}
        loading={mutations.archive.isPending || mutations.bulkRemove.isPending}
        onConfirm={() => {
          if (confirm?.type === 'archive') handleArchive()
          else handleDelete()
          setConfirm(null)
        }}
      />
    </div>
  )
}
