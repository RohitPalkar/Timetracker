import { NavLink, useParams } from 'react-router'
import { cn } from '@/lib/utils'
import { useSubProjectWorkspace } from './sub-project-workspace-context'
import { getVisibleSubProjectWorkspaceNav } from '@/config/sub-project-workspace-navigation'

/**
 * Sub Project-scoped workspace navigation (LEVEL 3). Renders only items the
 * actor's capabilities permit, as a horizontal bar distinct from the project
 * workspace nav above it. Active item is exposed to assistive tech via
 * aria-current.
 */
export function SubProjectWorkspaceNav({ className }: { className?: string }) {
  const { can } = useSubProjectWorkspace()
  const { projectId, subProjectId } = useParams()
  const items = getVisibleSubProjectWorkspaceNav(can)

  return (
    <nav
      aria-label="Sub project navigation"
      className={cn('flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface/60 p-1 scrollbar-none', className)}
    >
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={`/projects/${projectId}/sub-projects/${subProjectId}/${item.route}`}
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-ring-focus',
              isActive
                ? 'bg-primary-soft text-brand-700'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <item.icon className="size-4" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
