import * as React from 'react'
import { Filter as FilterIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterBarProps {
  label?: string
  children?: React.ReactNode
  /** Right-aligned actions (e.g. clear filters). */
  actions?: React.ReactNode
  className?: string
}

/** Shared container for planning filter controls — reuses status/assignee/priority pills. */
export function FilterBar({ label, children, actions, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {label && (
        <span className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
          <FilterIcon className="size-3.5" aria-hidden="true" />
          {label}
        </span>
      )}
      {children}
      {actions && <span className="ml-auto flex items-center gap-2">{actions}</span>}
    </div>
  )
}