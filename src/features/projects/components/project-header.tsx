import { CalendarDays, MoreHorizontal, Pencil, Pin, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { ProjectHealthBadge, ProjectStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate } from '@/lib/formats'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

export interface ProjectHeaderProps {
  project: Project
  managerName: string
  onEdit: () => void
  onAddMember: () => void
  onArchive: () => void
  onCopyLink: () => void
  className?: string
}

/** Details-page header: identity, status, meta and quick actions. */
export function ProjectHeader({
  project,
  managerName,
  onEdit,
  onAddMember,
  onArchive,
  onCopyLink,
  className,
}: ProjectHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-[26px] sm:leading-8">
              {project.name}
            </h1>
            <Badge variant="outline" className="font-mono text-[11px]">
              {project.key}
            </Badge>
            <ProjectStatusBadge status={project.status} />
            <ProjectHealthBadge health={project.health} />
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-5 text-muted-foreground">{project.description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Pencil aria-hidden="true" /> Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="More project actions">
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={onAddMember}>
                <UserPlus aria-hidden="true" /> Add team member
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onCopyLink}>
                <Pin aria-hidden="true" /> Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onArchive} className="text-danger focus:text-danger">
                <CalendarDays aria-hidden="true" /> Archive project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-3 text-[13px] text-muted-foreground">
        <span>
          Client: <span className="font-medium text-foreground">{project.client ?? 'Internal'}</span>
        </span>
        <span>
          Manager: <span className="font-medium text-foreground">{managerName}</span>
        </span>
        <span>
          Dates: <span className="font-medium text-foreground">{formatDate(project.startDate)} – {formatDate(project.endDate)}</span>
        </span>
        <span>
          Budget: <span className="font-medium text-foreground">{formatCurrency(project.budget)}</span>
        </span>
        <div className="ml-auto flex w-full items-center gap-2 sm:w-48">
          <Progress value={project.progress} className="flex-1" />
          <span className="shrink-0 font-semibold text-foreground">{project.progress}%</span>
        </div>
      </div>
    </header>
  )
}
