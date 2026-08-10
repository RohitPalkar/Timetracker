import * as React from 'react'
import { useNavigate } from 'react-router'
import {
  BarChart3,
  Bell,
  Bot,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Cog,
  FileText,
  FolderKanban,
  History,
  LayoutDashboard,
  Lock,
  Settings,
  Shield,
  Sparkles,
  ThumbsUp,
  UserCog,
  Users,
  Zap,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useCommandPalette } from '@/store/command-palette'

const PAGES = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Employees', to: '/employees', icon: Users },
  { label: 'Teams', to: '/teams', icon: Users },
  { label: 'Departments', to: '/departments', icon: Building2 },
  { label: 'Roles', to: '/roles', icon: Shield },
  { label: 'Permissions', to: '/permissions', icon: Lock },
  { label: 'My Timesheet', to: '/timesheets/my', icon: ClipboardList },
  { label: 'Team Timesheets', to: '/timesheets/team', icon: Users },
  { label: 'Approvals', to: '/timesheets/approvals', icon: ClipboardCheck },
  { label: 'Calendar', to: '/timesheets/calendar', icon: CalendarDays },
  { label: 'Timesheet Reports', to: '/timesheets/reports', icon: BarChart3 },
  { label: 'AI Agents', to: '/ai/agents', icon: Bot },
  { label: 'AI Usage', to: '/ai/usage', icon: Zap },
  { label: 'Prompt Library', to: '/ai/prompts', icon: Sparkles },
  { label: 'Knowledge Base', to: '/ai/knowledge', icon: BookOpen },
  { label: 'AI History', to: '/ai/history', icon: History },
  { label: 'Reports & Analytics', to: '/reports', icon: BarChart3 },
  { label: 'Survey', to: '/survey', icon: ThumbsUp },
  { label: 'Documents', to: '/documents', icon: FileText },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Administration', to: '/admin', icon: Cog },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Profile', to: '/settings/profile', icon: UserCog },
]

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const navigate = useNavigate()

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, projects…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGES.map((page) => (
            <CommandItem
              key={page.to}
              value={page.label}
              onSelect={() => {
                setOpen(false)
                navigate(page.to)
              }}
            >
              <page.icon className="size-4 text-muted-foreground" aria-hidden="true" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem
            value="New project"
            onSelect={() => {
              setOpen(false)
              navigate('/projects/new')
            }}
          >
            <FolderKanban className="size-4 text-muted-foreground" aria-hidden="true" />
            New project
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
