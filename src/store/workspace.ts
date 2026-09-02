import { create } from 'zustand'

export type WorkspaceView = 'board' | 'list' | 'calendar'

export interface WorkspaceFilters {
  status?: string
  priority?: string
  assigneeId?: string
  epicId?: string
}

interface WorkspaceState {
  /**
   * Active project workspace context. Set from the route by the WorkspaceLayout,
   * never from individual pages — every planning page stays scoped to one project.
   */
  projectId: string | null
  setProjectId: (projectId: string | null) => void

  /** Project-scoped planning UI state (no server/business data lives here). */
  sprintId: string | null
  view: WorkspaceView
  search: string
  filters: WorkspaceFilters
  setSprintId: (sprintId: string | null) => void
  setView: (view: WorkspaceView) => void
  setSearch: (search: string) => void
  setFilter: (key: keyof WorkspaceFilters, value: string | undefined) => void
  clearFilters: () => void
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  projectId: null,
  sprintId: null,
  view: 'board',
  search: '',
  filters: {},

  setProjectId: (projectId) =>
    set({ projectId, sprintId: null, view: 'board', search: '', filters: {} }),

  setSprintId: (sprintId) => set({ sprintId }),
  setView: (view) => set({ view }),
  setSearch: (search) => set({ search }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  clearFilters: () => set({ filters: {} }),
}))

/** Reset planning-scoped UI state while keeping the project context. */
export function resetWorkspaceProjectState() {
  useWorkspace.getState().setProjectId(null)
}