import { useNavigate } from 'react-router'
import { KanbanSquare, PackageOpen, Plus, Rocket, Target } from 'lucide-react'
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
  { label: 'New project', description: 'Create a project and team', icon: PackageOpen, to: '/projects/new' },
  { label: 'New story', description: 'Add a story to the backlog', icon: Target, to: '/workspace/backlog' },
  { label: 'New bug', description: 'Report an issue or defect', icon: KanbanSquare, to: '/workspace/board' },
  { label: 'New sprint', description: 'Plan the next sprint', icon: Rocket, to: '/workspace/sprints' },
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