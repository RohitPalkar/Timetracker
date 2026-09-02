import { create } from 'zustand'
import type { DashboardDateRange, DashboardFilters } from '@/types/dashboard'
import { DEFAULT_DATE_RANGE } from '@/config/dashboard-config'

export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
  projectId: 'all',
  teamId: 'all',
  dateRange: DEFAULT_DATE_RANGE,
  sprintId: 'all',
}

interface DashboardFilterState {
  filters: DashboardFilters
  setProject: (projectId: string) => void
  setTeam: (teamId: string) => void
  setDateRange: (dateRange: DashboardDateRange) => void
  setSprint: (sprintId: string) => void
  reset: () => void
}

/**
 * Central shared filter state for the dashboard. Every widget reads the same
 * store so one filter change re-queries the whole aggregate once.
 */
export const useDashboardFiltersStore = create<DashboardFilterState>((set) => ({
  filters: EMPTY_DASHBOARD_FILTERS,

  setProject: (projectId) => set((state) => ({ filters: { ...state.filters, projectId } })),
  setTeam: (teamId) => set((state) => ({ filters: { ...state.filters, teamId } })),
  setDateRange: (dateRange) => set((state) => ({ filters: { ...state.filters, dateRange } })),
  setSprint: (sprintId) => set((state) => ({ filters: { ...state.filters, sprintId } })),
  reset: () => set({ filters: EMPTY_DASHBOARD_FILTERS }),
}))

/** Convenience hook exposing the current filters plus setters. */
export function useDashboardFilters() {
  const filters = useDashboardFiltersStore((state) => state.filters)
  const setProject = useDashboardFiltersStore((state) => state.setProject)
  const setTeam = useDashboardFiltersStore((state) => state.setTeam)
  const setDateRange = useDashboardFiltersStore((state) => state.setDateRange)
  const setSprint = useDashboardFiltersStore((state) => state.setSprint)
  const reset = useDashboardFiltersStore((state) => state.reset)

  const isDefault =
    filters.projectId === 'all' &&
    filters.teamId === 'all' &&
    filters.dateRange === DEFAULT_DATE_RANGE &&
    filters.sprintId === 'all'

  return { filters, setProject, setTeam, setDateRange, setSprint, reset, isDefault }
}
