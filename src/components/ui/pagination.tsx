import * as React from 'react'
import { cn } from '@/lib/utils'

const Pagination = React.forwardRef<HTMLElement, React.ComponentProps<'nav'>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full items-center justify-center gap-1', className)}
      {...props}
    />
  ),
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  ),
)
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />,
)
PaginationItem.displayName = 'PaginationItem'

interface PaginationLinkProps extends React.ComponentProps<'button'> {
  active?: boolean
}

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring-focus disabled:pointer-events-none disabled:opacity-50',
        active
          ? 'bg-primary-soft text-brand-700'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      )}
      {...props}
    />
  ),
)
PaginationLink.displayName = 'PaginationLink'

export { Pagination, PaginationContent, PaginationItem, PaginationLink }