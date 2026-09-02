import { NavLink, useParams } from 'react-router'
import { cn } from '@/lib/utils'
import { useProjectWorkspace } from './project-workspace-context'
import { getVisibleWorkspaceNav } from '@/config/project-workspace-navigation'

/**
 * Project-scoped workspace navigation (LEVEL 2). Renders only items the
 * actor's capabilities permit, as a horizontal bar distinct from the global
 * sidebar. Active item is exposed to assistive tech via aria-current.
 */
export function ProjectWorkspaceNav({ className }: { className?: string }) {
  const { can } = useProjectWorkspace()
  const { projectId } = useParams()
  const items = getVisibleWorkspaceNav(can)

  return (
    <nav
      aria-label="Project navigation"
      className={cn('flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface/60 p-1 scrollbar-none', className)}
    >
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={`/projects/${projectId}/${item.route}`}
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
