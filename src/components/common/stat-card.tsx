import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  sub?: React.ReactNode
  loading?: boolean
  className?: string
}

/** Compact stat used inside tables, toolbars and side panels. */
export function StatCard({ label, value, icon: Icon, sub, loading, className }: StatCardProps) {
  return (
    <Card className={cn('py-4', className)}>
      <CardContent className="flex items-center gap-3 p-0 px-4">
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-5 w-16" />
          ) : (
            <p className="truncate text-lg font-semibold leading-6 text-foreground">{value}</p>
          )}
          {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}