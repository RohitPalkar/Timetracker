import { ShieldX } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ForbiddenStateProps {
  /** Route for the back action. */
  backTo?: string
  backLabel?: string
  className?: string
  /** Default copy targets create-project; workspace access passes its own. */
  title?: string
  description?: string
}

/**
 * Shown when an authenticated user is denied a guarded route or action —
 * e.g. reaching create-project without `projects.create`, or opening a
 * project workspace outside the actor's permitted scope.
 */
export function ForbiddenState({
  backTo = '/projects',
  backLabel = 'Back to projects',
  className,
  title = "You don't have permission to do this",
  description = 'Creating projects is restricted to administrators and project managers. Ask an administrator to grant you access.',
}: ForbiddenStateProps) {
  const navigate = useNavigate()
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}
      role="alert"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <ShieldX className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mx-auto max-w-sm text-[13px] leading-5 text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" onClick={() => navigate(backTo)} className="mt-1">
        {backLabel}
      </Button>
    </div>
  )
}
