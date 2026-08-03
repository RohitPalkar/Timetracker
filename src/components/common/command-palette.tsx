import * as React from 'react'
import { useNavigate } from 'react-router'
import { Layers, LayoutDashboard, Settings, Users } from 'lucide-react'
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
import { NAV_GROUPS } from '@/config/navigation'

const PAGES = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: Layers },
  { label: 'People', to: '/people', icon: Users },
  { label: 'Settings', to: '/settings', icon: Settings },
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
      <CommandInput placeholder="Search pages, stories, projects…" />
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
        <CommandGroup heading="Workspace">
          {NAV_GROUPS.filter((group) => group.label === 'Workspace')
            .flatMap((group) => group.items)
            .map((item) => (
              <CommandItem
                key={item.to}
                value={item.label}
                onSelect={() => {
                  setOpen(false)
                  navigate(item.to)
                }}
              >
                <item.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                {item.label}
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}