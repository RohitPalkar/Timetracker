import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PageLayoutProps {
  /** Page header */
  header: React.ReactNode
  /** Filters bar — sits between header and content */
  filters?: React.ReactNode
  /** Main content */
  children: React.ReactNode
  /** Secondary panels rendered beside/after content */
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  /** Constrain width */
  wide?: boolean
  className?: string
  contentClassName?: string
}

/**
 * The single page template every module uses:
 * Header → Filters → Content → Secondary panels → Footer.
 */
export function PageLayout({
  header,
  filters,
  children,
  sidebar,
  footer,
  wide = false,
  className,
  contentClassName,
}: PageLayoutProps) {
  return (
    <main className={cn('flex w-full flex-col gap-6', className)}>
      {header}

      {filters && <div className="flex flex-col gap-3">{filters}</div>}

      <div className={cn('flex flex-1 flex-col gap-6 xl:flex-row', wide && 'flex-col')}>
        <div className={cn('min-w-0 flex-1', wide && 'w-full', contentClassName)}>{children}</div>
        {sidebar && <aside className="w-full shrink-0 xl:w-80">{sidebar}</aside>}
      </div>

      {footer && <footer className="border-t border-border pt-4">{footer}</footer>}
    </main>
  )
}