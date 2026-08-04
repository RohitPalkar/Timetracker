import { create } from 'zustand'

export type PlanningView = 'board' | 'list' | 'calendar'

export interface PlanningFilters {
  status?: string
  priority?: string
  assigneeId?: string
  epicId?: string
}

export interface PlanningState {
  projectId: string | null
  sprintId: string | null
  search: string
  view: PlanningView
  filters: PlanningFilters
  setProjectId: (projectId: string | null) => void
  setSprintId: (sprintId: string | null) => void
  setSearch: (search: string) => void
  setView: (view: PlanningView) => void
  setFilter: (key: keyof PlanningFilters, value: string | undefined) => void
  clearFilters: () => void
}

export const usePlanning = create<PlanningState>((set) => ({
  projectId: null,
  sprintId: null,
  search: '',
  view: 'board',
  filters: {},
  setProjectId: (projectId) =>
    set({ projectId, sprintId: null }),
  setSprintId: (sprintId) => set({ sprintId }),
  setSearch: (search) => set({ search }),
  setView: (view) => set({ view }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  clearFilters: () => set({ filters: {} }),
}))
