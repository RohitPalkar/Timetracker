import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type LucideIcon } from 'lucide-react'

const cardVariants = cva('', {
  variants: {
    interactive: {
      true: 'cursor-pointer transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:shadow-md hover:border-border-strong',
      false: '',
    },
  },
})

export interface MetricCardProps extends VariantProps<typeof cardVariants> {
  title: string
  value: React.ReactNode
  icon?: LucideIcon
  iconTone?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  trend?: number
  trendLabel?: string
  hint?: string
  loading?: boolean
  onClick?: () => void
  className?: string
}

const ICON_TONES = {
  brand: 'bg-primary-soft text-brand-700',
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-success-soft text-success-foreground',
  warning: 'bg-warning-soft text-warning-foreground',
  danger: 'bg-danger-soft text-danger-foreground',
  info: 'bg-info-soft text-info-foreground',
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconTone = 'brand',
  trend,
  trendLabel,
  hint,
  loading,
  onClick,
  className,
  interactive = false,
}: MetricCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(cardVariants({ interactive }), onClick && 'cursor-pointer hover:shadow-md', className)}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', ICON_TONES[iconTone])}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-semibold leading-none tracking-tight text-foreground">{value}</span>
              {typeof trend === 'number' && (
                <span
                  className={cn(
                    'text-[13px] font-medium',
                    trend >= 0 ? 'text-success-foreground' : 'text-danger-foreground',
                  )}
                  aria-label={`${trend >= 0 ? 'up' : 'down'} ${Math.abs(trend)}%`}
                >
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {trendLabel ?? hint ?? 'Compared to last period'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}