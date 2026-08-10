/**
 * Central service barrel — the repository layer of the app.
 * Feature code imports from here, never from mock modules directly.
 * Swap mock repositories for REST implementations in the integration phase
 * without touching feature code.
 */
export { api, ApiError, IS_MOCK_MODE } from './http'
export { authService } from './auth'
export { projectService } from './project'
export type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectListParams,
  AddMemberInput,
  ProjectMemberRecord,
  ProjectListItem,
  ProjectDetail,
  ProjectWorkspaceContext,
} from './project'
export { subProjectService } from './sub-project'
export type { SubProjectMemberRecord, SubProjectDetail } from './sub-project'
export { teamService } from './team'
export type { TeamRecord } from './team'
export { epicRepository } from './epic'
export type { EpicListParams } from './epic'
export { storyRepository } from './story'
export { bugRepository } from './bug'
export { sprintRepository } from './sprint'
export { releaseRepository } from './release'
export type { ReleaseListParams } from './release'
export { userService } from './user'
export { notificationService } from './notification'
export { dashboardService } from './dashboard'
export { stores } from './stores'
export type {
  DashboardPayload,
  DashboardFilters,
  DashboardFilterOptions,
  DashboardKpi,
} from '@/types/dashboard'