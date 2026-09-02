import { ChartCard } from '@/components/charts/chart-card'
import { ProjectHealthBadge } from '@/components/common/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/empty-state'
import { formatCurrency } from '@/lib/formats'
import { cn } from '@/lib/utils'
import type { BudgetConsumption } from '@/types/dashboard'

export interface BudgetConsumptionProps {
  data: BudgetConsumption[]
  loading?: boolean
}

function barTone(percent: number): string {
  if (percent >= 90) return 'bg-danger'
  if (percent >= 70) return 'bg-warning'
  return 'bg-brand-500'
}

export function BudgetConsumptionWidget({ data, loading }: BudgetConsumptionProps) {
  return (
    <ChartCard title="Budget vs Consumed" description="Budget utilization per project" loading={loading}>
      {loading ? (
        <SkeletonList />
      ) : data.length === 0 ? (
        <EmptyState title="No budget data" description="Project budgets will appear here." compact />
      ) : (
        <ul className="flex flex-col gap-4">
          {data.map((project) => (
            <li key={project.projectId} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-[13px] font-medium text-foreground">{project.name}</p>
                <div className="flex shrink-0 items-center gap-2">
                  <ProjectHealthBadge health={project.health} className="hidden sm:inline-flex" />
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{project.consumedPercent}%</span>
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className={cn('h-full rounded-full', barTone(project.consumedPercent))} style={{ width: `${project.consumedPercent}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {formatCurrency(project.spent)} of {formatCurrency(project.budget)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  )
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  )
}
