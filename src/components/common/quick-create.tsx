import { useNavigate } from 'react-router'
import { FolderKanban, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const CREATE_ACTIONS = [
  { label: 'New project', description: 'Create a project and team', icon: FolderKanban, to: '/projects/new' },
]

export function QuickCreate() {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Quick create</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CREATE_ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onSelect={() => {
              toast.info(`${action.label} — coming in Phase 2`)
              navigate(action.to)
            }}
          >
            <action.icon className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="flex flex-col">
              <span className="text-[13px] font-medium">{action.label}</span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
