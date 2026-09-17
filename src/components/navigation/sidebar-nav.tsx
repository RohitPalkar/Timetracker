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
  permission?: import('@/types/permission').PermissionKey | import('@/types/permission').PermissionKey[]
  children?: NavItem[]
}

export interface NavGroup {
  id?: string
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

function itemIsActive(item: NavItem, activePath: string): boolean {
  if (isActive(item.to, activePath, item.end)) return true
  if (item.children?.some((c) => isActive(c.to, activePath, c.end))) return true
  return false
}

function NavLinkItem({ item, activePath, collapsed, onNavigate }: { item: NavItem } & Omit<SidebarNavProps, 'groups'>) {
  const active = isActive(item.to, activePath ?? '', item.end)
  const content = (
    <>
      <item.icon
        className={cn('size-4 shrink-0 transition-colors', active ? 'text-foreground' : 'text-sidebar-muted group-hover/item:text-foreground')}
        aria-hidden="true"
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left text-[13px]">{item.label}</span>
          {typeof item.badge === 'number' && item.badge > 0 && (
            <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[11px] font-medium text-brand-700">{item.badge}</span>
          )}
        </>
      )}
    </>
  )
  const linkClass = cn(
    'group/item flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-ring-focus',
    collapsed && 'justify-center px-2',
    active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
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

function NavParentItem({
  item,
  activePath,
  collapsed,
  onNavigate,
}: {
  item: NavItem & { children: NavItem[] }
} & Omit<SidebarNavProps, 'groups'>) {
  const parentActive = itemIsActive(item, activePath ?? '')
  const childActive = item.children.some((c) => isActive(c.to, activePath ?? '', c.end))

  // Collapsed: just show parent icon with tooltip behavior (no children)
  if (collapsed) {
    return <NavLinkItem item={item} activePath={activePath} collapsed={collapsed} onNavigate={onNavigate} />
  }

  return (
    <Collapsible defaultOpen={parentActive || childActive} className="space-y-0.5">
      <div
        className={cn(
          'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors focus-within:outline-2 focus-within:outline-ring-focus',
          parentActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )}
      >
        <Link to={item.to} onClick={onNavigate} className="flex flex-1 items-center gap-2 truncate focus-visible:outline-none" aria-current={parentActive ? 'page' : undefined}>
          <item.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate text-left">{item.label}</span>
        </Link>
        <CollapsibleTrigger
          className="flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-ring-focus"
          aria-label={`Toggle ${item.label}`}
        >
          <ChevronDown className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-0.5 pl-3">
        <div className="ml-2 border-l border-sidebar-border pl-2">
          {item.children.map((child) => (
            <NavLinkItem key={child.to + child.label} item={{ ...child, icon: child.icon }} activePath={activePath} collapsed={false} onNavigate={onNavigate} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function NavGroupSection({ group, collapsed, activePath, onNavigate }: { group: NavGroup } & Omit<SidebarNavProps, 'groups'>) {
  const groupActive = group.items.some((item) => itemIsActive(item, activePath ?? ''))

  if (group.collapsible === false) {
    return (
      <div className="space-y-1">
        {!collapsed && (
          <p className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">{group.label}</p>
        )}
        {group.items.map((item) =>
          item.children && item.children.length > 0 ? (
            <NavParentItem key={item.label} item={item as NavItem & { children: NavItem[] }} activePath={activePath} collapsed={collapsed} onNavigate={onNavigate} />
          ) : (
            <NavLinkItem key={item.to + item.label} item={item} activePath={activePath} collapsed={collapsed} onNavigate={onNavigate} />
          ),
        )}
      </div>
    )
  }

  return (
    <Collapsible defaultOpen={groupActive || collapsed === false}>
      <CollapsibleTrigger
        className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-muted focus-visible:outline-2 focus-visible:outline-ring-focus"
        aria-expanded={groupActive}
      >
        {!collapsed ? (
          <>
            <span className="flex-1 truncate text-left">{group.label}</span>
            <ChevronDown className="size-3 text-sidebar-muted transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
          </>
        ) : (
          <span className="flex-1" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pt-1">
        {group.items.map((item) =>
          item.children && item.children.length > 0 ? (
            <NavParentItem key={item.label} item={item as NavItem & { children: NavItem[] }} activePath={activePath} collapsed={collapsed} onNavigate={onNavigate} />
          ) : (
            <NavLinkItem key={item.to + item.label} item={item} activePath={activePath} collapsed={collapsed} onNavigate={onNavigate} />
          ),
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SidebarNav({ groups, collapsed, activePath, onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4 scrollbar-none" aria-label="Main navigation">
      {groups.map((group) => (
        <NavGroupSection key={group.label} group={group} collapsed={collapsed} activePath={activePath} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}
