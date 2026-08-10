import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services'
import type { DashboardFilters, DashboardPersona, DashboardPayload, DashboardFilterOptions } from '@/types/dashboard'

/** Whole-dashboard payload for a persona + filter scope. One request. */
export function useDashboard(persona: DashboardPersona, filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', persona, filters],
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
