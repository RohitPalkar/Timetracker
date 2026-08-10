import * as React from 'react'
import { CalendarDays, List, SquareKanban } from 'lucide-react'
import { PageLayout } from '@/components/common/page-layout'
import { SearchBox } from '@/components/common/search-box'
import { QuickCreate } from '@/components/common/quick-create'
import { cn } from '@/lib/utils'
import { useWorkspace, type WorkspaceView } from '@/store/workspace'
import { PlanningHeader } from './components/planning-header'
import { SprintSelector } from './components/sprint-selector'
import { FilterBar } from './components/filter-bar'

export interface PlanningLayoutProps {
  title: string
  description?: string
  breadcrumb?: React.ComponentProps<typeof PlanningHeader>['breadcrumb']
  /** Header actions (e.g. primary create button). */
  actions?: React.ReactNode
  /** Page-specific filter controls rendered in the shared filter bar. */
  filters?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const VIEW_OPTIONS: Array<{ value: WorkspaceView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: 'board', label: 'Board', icon: SquareKanban },
  { value: 'list', label: 'List', icon: List },
  { value: 'calendar', label: 'Calendar', icon: CalendarDays },
]

/**
 * Reusable Planning layout — project/sprint scope, search, view switcher,
 * quick create and a shared filter bar. Every Planning page composes this.
 */
export function PlanningLayout({
  title,
  description,
  breadcrumb,
  actions,
  filters,
  children,
  className,
}: PlanningLayoutProps) {
  const search = useWorkspace((state) => state.search)
  const setSearch = useWorkspace((state) => state.setSearch)
  const view = useWorkspace((state) => state.view)
  const setView = useWorkspace((state) => state.setView)
  const hasActiveFilters = useWorkspace((state) => Object.values(state.filters).some(Boolean))
  const clearFilters = useWorkspace((state) => state.clearFilters)

  return (
    <PageLayout
      header={<PlanningHeader title={title} description={description} breadcrumb={breadcrumb} actions={actions} />}
      className={className}
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-xs">
<div className="flex flex-wrap items-center gap-2">
        <SprintSelector className="w-48" />
        <div className="min-w-40 flex-1 sm:max-w-xs">
            <SearchBox
              value={search}
              onValueChange={setSearch}
              placeholder="Search planning…"
              aria-label="Search planning"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div
              className="flex items-center gap-1 rounded-xl border border-border bg-surface-subtle p-1"
              role="tablist"
              aria-label="View"
            >
              {VIEW_OPTIONS.map((option) => {
                const Icon = option.icon
                const active = view === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setView(option.value)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors',
                      active ? 'bg-surface text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                )
              })}
            </div>
            <QuickCreate />
          </div>
        </div>
        {filters && (
          <FilterBar
            className="border-t border-border pt-3"
            label="Filters"
            actions={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear
                </button>
              ) : undefined
            }
          >
            {filters}
          </FilterBar>
        )}
      </div>

      {children}
    </PageLayout>
  )
}
