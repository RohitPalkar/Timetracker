import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services'
import type { DashboardFilters, DashboardPayload, DashboardFilterOptions } from '@/types/dashboard'

/**
 * Single dashboard aggregation — API-ready: GET /api/v1/dashboard
 * Server derives org/project scope from session; client only sends display filters.
 * Supports legacy call `useDashboard(persona, filters)` and new `useDashboard(filters)`.
 */
export function useDashboard(a: DashboardFilters | unknown, b?: DashboardFilters | unknown) {
  const isFilters = (v: unknown): v is DashboardFilters =>
    !!v && typeof v === 'object' && 'projectId' in (v as Record<string, unknown>)
  const filters: DashboardFilters = isFilters(a) ? (a as DashboardFilters) : isFilters(b) ? (b as DashboardFilters) : (a as DashboardFilters)
  const persona = isFilters(a) ? b : a
  return useQuery({
    queryKey: ['dashboard', filters, persona ?? 'capability'],
    queryFn: () => dashboardService.getDashboard(filters),
  })
}

export function useDashboardFilterOptions() {
  return useQuery<DashboardFilterOptions>({
    queryKey: ['dashboard', 'filters'],
    queryFn: () => dashboardService.getFilterOptions(),
  })
}

export type { DashboardPayload }
