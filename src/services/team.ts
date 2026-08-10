/**
 * Team repository — delivery teams assigned to projects and sub-projects.
 */
import type { Team, User } from '@/types'
import { teamStore, userStore } from './stores'
import { ApiError, mockDelay } from './http'

export interface TeamRecord extends Team {
  members: User[]
}

function toRecord(team: Team): TeamRecord {
  return {
    ...team,
    members: team.memberIds.map((id) => userStore.get(id)).filter((user): user is User => Boolean(user)),
  }
}

export const teamService = {
  async list(projectId: string): Promise<TeamRecord[]> {
    await mockDelay(220)
    return teamStore
      .query({ filters: { projectId }, sort: { field: 'name', direction: 'asc' } })
      .items.map(toRecord)
  },

  async get(id: string): Promise<TeamRecord> {
    await mockDelay(180)
    const team = teamStore.get(id)
    if (!team) throw new ApiError('This team does not exist.', 404, 'TEAM_NOT_FOUND')
    return toRecord(team)
  },

  async getBySubProject(subProjectId: string): Promise<TeamRecord[]> {
    await mockDelay(200)
    return teamStore.all().filter((team) => team.subProjectIds.includes(subProjectId)).map(toRecord)
  },
}
