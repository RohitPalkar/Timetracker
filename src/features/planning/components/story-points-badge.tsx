import { cn } from '@/lib/utils'

/** Story points chip — a fixed-size badge showing the estimate. */
export function StoryPointsBadge({ points, className }: { points: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-[12px] font-semibold text-foreground',
        points === 0 && 'text-muted-foreground',
        className,
      )}
      aria-label={`${points} points`}
    >
      {points}
    </span>
  )
}