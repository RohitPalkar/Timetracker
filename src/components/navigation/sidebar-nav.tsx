import { Link } from 'react-router'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: number
  disabled?: boolean
  end?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
  collapsible?: boolean
}

export interface SidebarNavProps {
  groups: NavGroup[]
  collapsed?: boolean
  activePath?: string
  onNavigate?: () => void
}

function isActive(to: string, activePath: string, end?: boolean): boolean {
  if (end) return activePath === to
  return activePath === to || activePath.startsWith(`${to}/`)
}

function NavLinkItem({ item, activePath, collapsed, onNavigate }: { item: NavItem } & Omit<SidebarNavProps, 'groups'>) {
  const active = isActive(item.to, activePath ?? '', item.end)

  const content = (
    <>
      <item.icon
        className={cn(
          'size-[18px] shrink-0 transition-colors',
          active ? 'text-foreground' : 'text-sidebar-muted group-hover/item:text-foreground',
        )}
        aria-hidden="true"
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {typeof item.badge === 'number' && item.badge > 0 && (
            <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[11px] font-medium text-brand-700 dark:text-brand-200">
              {item.badge}
            </span>
          )}
        </>
      )}
    </>
  )

  const linkClass = cn(
    'group/item flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-ring-focus',
    collapsed && 'justify-center px-0',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
    item.disabled && 'pointer-events-none opacity-50',
  )

  if (item.disabled) {
    return (
      <span className={linkClass} aria-disabled="true">
        {content}
      </span>
    )
  }

  return (
    <Link to={item.to} className={linkClass} onClick={onNavigate} aria-current={active ? 'page' : undefined}>
      {content}
    </Link>
  )
}

function NavGroupSection({ group, collapsed, activePath, onNavigate }: { group: NavGroup } & Omit<SidebarNavProps, 'groups'>) {
  const groupActive = group.items.some((item) => isActive(item.to, activePath ?? '', item.end))

  if (group.collapsible === false) {
    return (
      <div className="space-y-0.5">
        {!collapsed && (
          <p className="px-2.5 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
            {group.label}
          </p>
        )}
        {group.items.map((item) => (
          <NavLinkItem key={item.to} item={item} activePath={activePath} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>
    )
  }

  return (
    <Collapsible defaultOpen={groupActive}>
      <CollapsibleTrigger className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-ring-focus">
        {!collapsed ? (
          <>
            <span className="flex-1 truncate text-left">{group.label}</span>
            <ChevronDown className="size-3.5 text-sidebar-muted transition-transform duration-[var(--duration-fast)] group-data-[state=open]:rotate-180" />
          </>
        ) : (
          <span className="flex-1" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pl-0">
        {group.items.map((item) => (
          <div key={item.to} className={cn('space-y-0.5', !collapsed && 'ml-3 border-l border-sidebar-border pl-2')}>
            <NavLinkItem item={item} activePath={activePath} collapsed={collapsed} onNavigate={onNavigate} />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SidebarNav({ groups, collapsed, activePath, onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-6 scrollbar-none" aria-label="Main navigation">
      {groups.map((group) => (
        <NavGroupSection key={group.label} group={group} collapsed={collapsed} activePath={activePath} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}