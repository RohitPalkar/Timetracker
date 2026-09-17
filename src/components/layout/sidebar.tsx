import { Link, useLocation } from 'react-router'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SidebarNav } from '@/components/navigation/sidebar-nav'
import { UserAvatar } from '@/components/common/user-avatar'
import { getFilteredNavGroups } from '@/config/navigation'
import { APP_NAME, SIDEBAR_STORAGE_KEY } from '@/constants'
import { useAuth } from '@/store/auth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  variant?: 'desktop' | 'mobile'
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onNavigate?: () => void
}

export function Sidebar({ variant = 'desktop', collapsed, onCollapsedChange, onNavigate }: SidebarProps) {
  const { pathname } = useLocation()
  const { authUser, permissions, can, activeOrganization } = useAuth()
  const groups = getFilteredNavGroups(permissions, can)

  if (variant === 'mobile') {
    return (
      <div className="flex h-full w-[272px] flex-col border-r border-border bg-sidebar">
        <SidebarBrand collapsed={false} activeOrgName={activeOrganization?.name} />
        <SidebarNav groups={groups} activePath={pathname} onNavigate={onNavigate} />
        <SidebarFooter authUser={authUser} collapsed={false} />
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-[var(--duration-fast)] lg:flex',
        collapsed ? 'w-[76px]' : 'w-[272px]',
      )}
    >
      <SidebarBrand collapsed={collapsed} activeOrgName={activeOrganization?.name} />
      <SidebarNav groups={groups} collapsed={collapsed} activePath={pathname} onNavigate={onNavigate} />
      <SidebarFooter authUser={authUser} collapsed={collapsed} />
      <CollapseToggle collapsed={collapsed} onCollapsedChange={onCollapsedChange} />
    </aside>
  )
}

function SidebarBrand({ collapsed, activeOrgName }: { collapsed: boolean; activeOrgName?: string | null }) {
  return (
    <div className={cn('flex h-[72px] items-center gap-2.5 border-b border-sidebar-border px-4', collapsed && 'justify-center px-0')}>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/dashboard" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                <path d="M12 3 4.5 6.6v10.8L12 21l7.5-3.6V6.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M8.5 10h7M8.5 14h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{activeOrgName ?? APP_NAME}</TooltipContent>
        </Tooltip>
      ) : (
        <Link to="/dashboard" className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-ring-focus">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
              <path d="M12 3 4.5 6.6v10.8L12 21l7.5-3.6V6.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8.5 10h7M8.5 14h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[15px] font-semibold tracking-tight text-sidebar-foreground">{APP_NAME}</span>
            <span className="truncate text-[11px] text-sidebar-muted">{activeOrgName ?? 'Workspace'}</span>
          </span>
        </Link>
      )}
    </div>
  )
}

function SidebarFooter({ authUser, collapsed }: { authUser: ReturnType<typeof useAuth>['authUser']; collapsed: boolean }) {
  return (
    <div className={cn('border-t border-sidebar-border p-3', collapsed && 'px-2.5')}>
      <Link
        to="/settings/profile"
        className={cn(
          'flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-2 focus-visible:outline-ring-focus',
          collapsed && 'justify-center px-0',
        )}
      >
        <UserAvatar name={authUser?.name ?? 'Guest'} size="sm" />
        {!collapsed && (
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[13px] font-medium text-sidebar-foreground">{authUser?.name ?? 'Guest'}</span>
            <span className="truncate text-[11px] text-sidebar-muted">{authUser?.designation ?? 'Sign in'}</span>
          </span>
        )}
      </Link>
    </div>
  )
}

function CollapseToggle({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}) {
  const toggle = () => {
    const next = !collapsed
    localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? 'collapsed' : 'expanded')
    onCollapsedChange(next)
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          className="absolute -right-3.5 top-[84px] size-7 rounded-full border border-border bg-surface shadow-md"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="size-3.5" /> : <ChevronsLeft className="size-3.5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{collapsed ? 'Expand' : 'Collapse'}</TooltipContent>
    </Tooltip>
  )
}