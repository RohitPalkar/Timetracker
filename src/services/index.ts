/**
 * Central service barrel.
 * Feature code imports from here — never from mock modules directly.
 */
export { api, ApiError, IS_MOCK_MODE } from './http'
export { authService } from './auth'
export { projectService } from './project'
export { storyService } from './story'
export { bugService } from './bug'
export { sprintService } from './sprint'
export { userService } from './user'
