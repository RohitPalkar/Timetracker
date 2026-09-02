import { ChartCard } from '@/components/charts/chart-card'
import { UserAvatar } from '@/components/common/user-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/empty-state'
import { formatHours } from '@/lib/formats'
import { cn } from '@/lib/utils'
import type { EmployeeHours } from '@/types/dashboard'

export interface EmployeeHoursProps {
  data: EmployeeHours[]
  loading?: boolean
}

const MAX_HOURS = 160

export function EmployeeHoursWidget({ data, loading }: EmployeeHoursProps) {
  return (
    <ChartCard title="Hours by Employee" description="Logged vs billable hours this period" loading={loading}>
      {loading ? (
        <SkeletonList />
      ) : data.length === 0 ? (
        <EmptyState title="No hours logged" description="Employee hours for the current filter will appear here." compact />
      ) : (
        <ul className="flex flex-col gap-4">
          {data.map((entry) => (
            <li key={entry.userId} className="flex items-center gap-3">
              <UserAvatar name={entry.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-medium text-foreground">{entry.name}</p>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{formatHours(entry.hours)}</span> logged
                  </p>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-info-foreground/70" style={{ width: `${(entry.hours / MAX_HOURS) * 100}%` }} />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">
                    <span className={cn('font-semibold', entry.utilization >= 80 ? 'text-success-foreground' : 'text-foreground')}>
                      {entry.utilization}%
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatHours(entry.billable)} billable · {entry.department}
                </p>
              </div>
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
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-1.5 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
