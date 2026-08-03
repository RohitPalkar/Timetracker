import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex min-w-0 items-center gap-1 text-[13px] text-muted-foreground', className)}
    >
      <Link
        to="/dashboard"
        className="shrink-0 rounded-md px-1.5 py-0.5 transition-colors hover:text-foreground"
      >
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <Fragment key={`${item.label}-${index}`}>
            <ChevronRight className="size-3.5 shrink-0 text-border-strong" aria-hidden="true" />
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="truncate rounded-md px-1.5 py-0.5 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="truncate px-1.5 py-0.5 font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}