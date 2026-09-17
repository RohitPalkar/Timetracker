import * as React from 'react'
import { useNavigate } from 'react-router'
import { Bell, ChevronDown, Menu, Settings, LogOut, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SearchBox } from '@/components/common/search-box'
import { UserAvatar } from '@/components/common/user-avatar'
import { QuickCreate } from '@/components/common/quick-create'
import { NotificationsDrawer } from '@/components/common/notifications-drawer'
import { useQueryClient } from '@tanstack/react-query'
import { useCommandPalette } from '@/store/command-palette'
import { useAuth } from '@/store/auth'
import { APP_NAME } from '@/constants'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { setOpen } = useCommandPalette()
  const { authUser, user, activeOrganization, signOut } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } finally {
      queryClient.clear()
      // Replace history so back button cannot expose authenticated content (§22)
      navigate('/login', { replace: true })
      // Force reload-safe clearing: ensure no stale data flashes after logout
      window.setTimeout(() => {
        if (window.location.pathname !== '/login') window.location.replace('/login')
      }, 50)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <div className="hidden items-center gap-2.5 md:flex">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
            <path d="M12 3 4.5 6.6v10.8L12 21l7.5-3.6V6.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M8.5 10h7M8.5 14h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-foreground">{APP_NAME}</span>
          <span className="text-[11px] text-muted-foreground">{activeOrganization?.name ?? 'Workspace'}</span>
        </span>
      </div>

      <div className="flex-1" />

      <SearchBox
        placeholder="Search anything…"
        shortcut="⌘K"
        className="hidden w-72 lg:block"
        onFocus={() => setOpen(true)}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Search (⌘K)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Notifications"
          >
            <Bell className="size-[18px]" aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-surface" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>

      <QuickCreate />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 gap-2 px-1.5" aria-label="Account menu">
            <UserAvatar name={authUser?.name ?? 'Guest'} size="sm" />
            <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <span className="block text-[13px] font-medium">{user?.name ?? authUser?.name ?? 'Guest'}</span>
            <span className="block text-xs font-normal text-muted-foreground">{user?.email ?? authUser?.email}</span>
            {activeOrganization && (
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                {activeOrganization.name} · {(authUser as unknown as { designation?: string })?.designation ?? 'Super Admin'}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate('/settings/profile')}>
            <UserCircle2 className="size-4" aria-hidden="true" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/settings')}>
            <Settings className="size-4" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleSignOut} className="text-danger focus:bg-danger/10 focus:text-danger">
            <LogOut className="size-4" aria-hidden="true" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationsDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </header>
  )
}