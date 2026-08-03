import * as React from 'react'
import { cn } from '@/lib/utils'

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'pointer-events-none inline-flex h-5 min-w-5 items-center justify-center rounded-[6px] border border-border-strong bg-surface px-1.5 font-mono text-[11px] font-medium text-muted-foreground shadow-xs',
        className,
      )}
    >
      {children}
    </kbd>
  )
}