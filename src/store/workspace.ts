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
   * Active project workspace context. Set from the route by the WorkspaceLayout.
   * Supports both:
   *   Project → Sprint (flat / CASE A,C)
   *   Project → SubProject → Sprint (structured / CASE B)
   * subProjectId is optional — never inferred from UI state alone.
   */
  projectId: string | null
  subProjectId: string | null
  organizationId: string | null
  setProjectContext: (params: { projectId: string | null; organizationId?: string | null; subProjectId?: string | null }) => void
  setSubProjectId: (subProjectId: string | null) => void
  /** @deprecated Use setProjectContext instead. */
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
  subProjectId: null,
  organizationId: null,
  sprintId: null,
  view: 'board',
  search: '',
  filters: {},

  setProjectContext: ({ projectId, organizationId = null, subProjectId = null }) =>
    set({ projectId, organizationId, subProjectId, sprintId: null, view: 'board', search: '', filters: {} }),

  setSubProjectId: (subProjectId) => set({ subProjectId, sprintId: null }),

  setProjectId: (projectId) =>
    set({ projectId, subProjectId: null, sprintId: null, view: 'board', search: '', filters: {} }),

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
  useWorkspace.getState().setProjectContext({ projectId: null, organizationId: null, subProjectId: null })
}