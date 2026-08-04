import { Drawer } from '@/components/common/drawer'
import { toast } from 'sonner'
import { ProjectForm } from './project-form'
import { useProjectMutations } from '../project-queries'
import { projectToFormValues } from '../project-form-utils'
import type { Project, User } from '@/types'
import type { ProjectFormValues } from '../project-form-schema'

export interface ProjectFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Provide a project to edit; omit to create. */
  project?: Project | null
  /** Included team members for the given project (edit mode prefill). */
  memberUserIds?: string[]
  users: User[]
}

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Something went wrong.')

/** Create / Edit project drawer — one component, two modes, no navigation. */
export function ProjectFormDrawer({ open, onOpenChange, project, memberUserIds, users }: ProjectFormDrawerProps) {
  const mutations = useProjectMutations()
  const isEdit = Boolean(project)
  const submitting = mutations.create.isPending || mutations.update.isPending

  const close = () => onOpenChange(false)

  const handleSubmit = (values: ProjectFormValues) => {
    const input = {
      name: values.name,
      key: values.key === '' ? undefined : values.key,
      client: values.client === '' ? undefined : values.client,
      description: values.description,
      ownerId: values.ownerId,
      businessAnalystId: values.businessAnalystId === '' ? undefined : values.businessAnalystId,
      startDate: values.startDate,
      endDate: values.endDate,
      budget: values.budget,
      status: values.status,
      teamMemberIds: values.teamMemberIds,
    }

    if (project) {
      mutations.update.mutate(
        { id: project.id, input },
        {
          onSuccess: () => {
            toast.success(`Project "${values.name}" updated`)
            close()
          },
          onError: (error) => toast.error(errorMessage(error)),
        },
      )
    } else {
      mutations.create.mutate(input, {
        onSuccess: (created) => {
          toast.success(`Project "${created.name}" created`)
          close()
        },
        onError: (error) => toast.error(errorMessage(error)),
      })
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      variant="large"
      title={isEdit ? `Edit ${project?.name}` : 'New project'}
      description={
        isEdit ? 'Update project details. Changes are saved immediately.' : 'Set up a new project to organize delivery.'
      }
      footer={null}
      bodyClassName="p-6"
    >
      <ProjectForm
        key={project?.id ?? 'new'}
        defaultValues={
          project ? projectToFormValues(project, memberUserIds ?? []) : { status: 'planned', teamMemberIds: [], budget: 0 }
        }
        users={users}
        submitLabel={isEdit ? 'Save changes' : 'Create project'}
        submitting={submitting}
        onCancel={close}
        onSubmit={handleSubmit}
      />
    </Drawer>
  )
}