import { FileQuestion } from 'lucide-react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface NotFoundStateProps {
  title?: string
  description?: string
  /** Route for the back action. */
  backTo?: string
  backLabel?: string
  className?: string
}

/** Shown when the requested entity does not exist (e.g. unknown project id). */
export function NotFoundState({
  title = 'Not found',
  description = 'This could not be found. It may have been removed, or the link may be incorrect.',
  backTo = '/',
  backLabel = 'Go back',
  className,
}: NotFoundStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)} role="status">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FileQuestion className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mx-auto max-w-sm text-[13px] leading-5 text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" asChild className="mt-1">
        <Link to={backTo}>
          <ArrowLeft aria-hidden="true" />
          {backLabel}
        </Link>
      </Button>
    </div>
  )
}
