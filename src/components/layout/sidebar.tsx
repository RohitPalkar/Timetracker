import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ChevronsLeft, ChevronsRight, LayoutDashboard, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SidebarNav } from '@/components/navigation/sidebar-nav'
import { UserAvatar } from '@/components/common/user-avatar'
import { getFilteredMainGroups, getFilteredSettingsGroups, NAV_MODE_KEY } from '@/config/navigation'
import { APP_NAME, SIDEBAR_STORAGE_KEY } from '@/constants'
import { useAuth } from '@/store/auth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  variant?: 'desktop' | 'mobile'
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onNavigate?: () => void
}

type NavMode = 'main' | 'settings'

function useNavMode(): [NavMode, (m: NavMode) => void] {
  const [mode, setMode] = React.useState<NavMode>(() => {
    const saved = localStorage.getItem(NAV_MODE_KEY) as NavMode | null
    return saved === 'settings' ? 'settings' : 'main'
  })
  const set = React.useCallback((next: NavMode) => {
    localStorage.setItem(NAV_MODE_KEY, next)
    setMode(next)
  }, [])
  return [mode, set]
}

export function Sidebar({ variant = 'desktop', collapsed, onCollapsedChange, onNavigate }: SidebarProps) {
  const { pathname } = useLocation()
  const { authUser, permissions, can, activeOrganization } = useAuth()
  const [navMode, setNavMode] = useNavMode()
  const navigate = useNavigate()

  // Auto-switch to settings if pathname is settings/profile
  React.useEffect(() => {
    if (pathname.startsWith('/settings') || pathname.startsWith('/roles') || pathname.startsWith('/permissions') || pathname.startsWith('/admin')) {
      // don't auto-force, but keep user choice
    }
  }, [pathname])

  const mainGroups = React.useMemo(() => getFilteredMainGroups(permissions, can), [permissions, can])
  const settingsGroups = React.useMemo(() => getFilteredSettingsGroups(permissions, can), [permissions, can])
  const groups = navMode === 'main' ? mainGroups : settingsGroups

  const handleModeSwitch = (next: NavMode) => {
    setNavMode(next)
    if (next === 'settings') navigate('/settings')
    else navigate('/dashboard')
    onNavigate?.()
  }

  if (variant === 'mobile') {
    return (
      <div className="flex h-full w-[228px] flex-col border-r border-border bg-sidebar">
        <SidebarBrand collapsed={false} activeOrgName={activeOrganization?.name} />
        <SidebarNav groups={groups} activePath={pathname} onNavigate={onNavigate} />
        <ModeSwitch mode={navMode} onChange={handleModeSwitch} collapsed={false} />
        <SidebarFooter authUser={authUser} collapsed={false} />
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-[var(--duration-fast)] lg:flex',
        collapsed ? 'w-[64px]' : 'w-[228px]',
      )}
    >
      <SidebarBrand collapsed={collapsed} activeOrgName={activeOrganization?.name} />
      <SidebarNav groups={groups} activePath={pathname} onNavigate={onNavigate} />
      <ModeSwitch mode={navMode} onChange={handleModeSwitch} collapsed={collapsed} />
      <SidebarFooter authUser={authUser} collapsed={collapsed} />
      <CollapseToggle collapsed={collapsed} onCollapsedChange={onCollapsedChange} />
    </aside>
  )
}

function SidebarBrand({ collapsed, activeOrgName }: { collapsed: boolean; activeOrgName?: string | null }) {
  return (
    <div className={cn('flex h-14 items-center gap-2 border-b border-sidebar-border px-3', collapsed && 'justify-center px-2')}>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/dashboard" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
                <path d="M12 3 4.5 6.6v10.8L12 21l7.5-3.6V6.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M8.5 10h7M8.5 14h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{activeOrgName ?? APP_NAME}</TooltipContent>
        </Tooltip>
      ) : (
        <Link to="/dashboard" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-ring-focus">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
              <path d="M12 3 4.5 6.6v10.8L12 21l7.5-3.6V6.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8.5 10h7M8.5 14h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13px] font-semibold tracking-tight text-sidebar-foreground">{APP_NAME}</span>
            <span className="truncate text-[11px] text-sidebar-muted">{activeOrgName ?? 'Workspace'}</span>
          </span>
        </Link>
      )}
    </div>
  )
}

function ModeSwitch({ mode, onChange, collapsed }: { mode: NavMode; onChange: (m: NavMode) => void; collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="border-t border-sidebar-border p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mode === 'main' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => onChange(mode === 'main' ? 'settings' : 'main')}
              aria-label={mode === 'main' ? 'Switch to Settings' : 'Switch to Main'}
              className="w-full"
            >
              {mode === 'main' ? <Settings className="size-4" /> : <LayoutDashboard className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{mode === 'main' ? 'Settings' : 'Main'}</TooltipContent>
        </Tooltip>
      </div>
    )
  }
  return (
    <div className="border-t border-sidebar-border p-2">
      <div className="flex rounded-lg bg-sidebar-accent p-1">
        <button
          type="button"
          onClick={() => onChange('main')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
            mode === 'main' ? 'bg-surface text-foreground shadow-xs' : 'text-sidebar-muted hover:text-foreground',
          )}
          aria-pressed={mode === 'main'}
        >
          <LayoutDashboard className="size-3.5" /> Main
        </button>
        <button
          type="button"
          onClick={() => onChange('settings')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
            mode === 'settings' ? 'bg-surface text-foreground shadow-xs' : 'text-sidebar-muted hover:text-foreground',
          )}
          aria-pressed={mode === 'settings'}
        >
          <Settings className="size-3.5" /> Settings
        </button>
      </div>
    </div>
  )
}

function SidebarFooter({ authUser, collapsed }: { authUser: ReturnType<typeof useAuth>['authUser']; collapsed: boolean }) {
  return (
    <div className={cn('border-t border-sidebar-border p-2', collapsed && 'px-2')}>
      <Link
        to="/settings/profile"
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-2 focus-visible:outline-ring-focus',
          collapsed && 'justify-center px-0',
        )}
      >
        <UserAvatar name={authUser?.name ?? 'Guest'} size="sm" />
        {!collapsed && (
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-medium text-sidebar-foreground">{authUser?.name ?? 'Guest'}</span>
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
          className="absolute -right-3 top-16 size-6 rounded-full border border-border bg-surface shadow-sm"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="size-3" /> : <ChevronsLeft className="size-3" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{collapsed ? 'Expand' : 'Collapse'}</TooltipContent>
    </Tooltip>
  )
}
