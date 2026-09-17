import type { Project } from '@/types'
import type { ProjectFormValues } from './project-form-schema'

/** Maps a persisted project + its non-ownership members into form values. */
export function projectToFormValues(project: Project, memberUserIds: string[]): ProjectFormValues {
  return {
    name: project.name,
    key: project.key,
    client: project.client ?? '',
    type: project.type ?? 'platform',
    description: project.description,
    managerIds: project.managerIds.length > 0 ? project.managerIds : project.ownerId ? [project.ownerId] : [],
    ownerId: project.ownerId,
    businessAnalystId: project.businessAnalystId ?? '',
    startDate: project.startDate.slice(0, 10),
    endDate: project.endDate.slice(0, 10),
    budget: project.budget,
    status: project.status,
    teamMemberIds: memberUserIds,
  }
}

/** Members who are not the manager or business analyst form the "team" roster. */
export function rosterMemberIds(members: Array<{ userId: string; role: string }>): string[] {
  return members
    .filter((member) => member.role !== 'manager' && member.role !== 'business_analyst')
    .map((member) => member.userId)
}