import { ChartCard } from '@/components/charts/chart-card'
import { UserAvatar } from '@/components/common/user-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/empty-state'
import { cn } from '@/lib/utils'
import type { BugOwnerStat } from '@/types/dashboard'

export interface TopBugOwnersProps {
  data: BugOwnerStat[]
  loading?: boolean
}

const MAX_BAR = 30

export function TopBugOwnersWidget({ data, loading }: TopBugOwnersProps) {
  return (
    <ChartCard title="Top Bug Owners" description="Open, critical and resolved bugs by assignee" loading={loading}>
      {loading ? (
        <SkeletonList />
      ) : data.length === 0 ? (
        <EmptyState title="No bug owners" description="Bugs tracked by assignee will appear here." compact />
      ) : (
        <ul className="flex flex-col gap-4">
          {data.map((owner) => (
            <li key={owner.userId} className="flex items-center gap-3">
              <UserAvatar name={owner.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-medium text-foreground">{owner.name}</p>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{owner.total}</span> total
                  </p>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.min((owner.open / MAX_BAR) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">
                    <span className={cn('font-semibold', owner.critical > 0 ? 'text-danger-foreground' : 'text-foreground')}>
                      {owner.open} open
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {owner.critical > 0 && <span className="font-medium text-danger-foreground">{owner.critical} critical</span>}
                  {owner.critical > 0 && ' · '}
                  {owner.resolved} resolved
                  {typeof owner.trend === 'number' && owner.trend !== 0 && (
                    <span className={cn('ml-1', owner.trend < 0 ? 'text-success-foreground' : 'text-danger-foreground')}>
                      {owner.trend > 0 ? '↑' : '↓'} {Math.abs(owner.trend)}%
                    </span>
                  )}
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
