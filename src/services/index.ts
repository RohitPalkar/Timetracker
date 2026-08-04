/**
 * Central service barrel — the repository layer of the app.
 * Feature code imports from here, never from mock modules directly.
 * Swap mock repositories for REST implementations in the integration phase
 * without touching feature code.
 */
export { api, ApiError, IS_MOCK_MODE } from './http'
export { authService } from './auth'
export { projectService } from './project'
export { storyService } from './story'
export { bugService } from './bug'
export { sprintService } from './sprint'
export { userService } from './user'
export { notificationService } from './notification'
export { dashboardService } from './dashboard'
export { stores } from './stores'
export type { DashboardOverview, DashboardMetric } from './dashboard'