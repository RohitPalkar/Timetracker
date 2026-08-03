import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  compact?: boolean
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Try again, or check back in a moment.',
  onRetry,
  compact = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        compact ? 'px-4 py-10' : 'px-6 py-16',
        className,
      )}
      role="alert"
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-2xl bg-danger-soft text-danger',
          compact ? 'size-10' : 'size-14',
        )}
      >
        <AlertTriangle className={compact ? 'size-5' : 'size-6'} aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h3 className={cn('font-semibold text-foreground', compact ? 'text-sm' : 'text-base')}>{title}</h3>
        <p className="mx-auto max-w-sm text-[13px] leading-5 text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size={compact ? 'sm' : 'md'} onClick={onRetry} className="mt-1">
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  )
}