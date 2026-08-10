import { ArrowLeft, MoreHorizontal, Pencil, Settings, Archive } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
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
import { ProjectHealthBadge, ProjectStatusBadge } from '@/components/common/status-badge'
import { UserAvatar } from '@/components/common/user-avatar'
import { useProjectWorkspace } from './project-workspace-context'

export interface ProjectWorkspaceHeaderProps {
  managerName: string
  onEdit: () => void
  onArchive: () => void
}

/**
 * Project context header (LEVEL 2): establishes which project the workspace
 * belongs to without duplicating content that lives in workspace screens.
 * Actions are capability-driven — no hardcoded role checks.
 */
export function ProjectWorkspaceHeader({ managerName, onEdit, onArchive }: ProjectWorkspaceHeaderProps) {
  const { project, can } = useProjectWorkspace()
  const navigate = useNavigate()

  const canEdit = can('projects.edit')
  const canArchive = can('projects.archive')
  const canSettings = can('projects.settings')
  const hasMenuActions = canArchive || canSettings

  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/projects"
        className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1.5 py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring-focus"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Projects
      </Link>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{project.name}</h1>
            <Badge variant="outline" className="font-mono text-[11px]">
              {project.key}
            </Badge>
            <ProjectStatusBadge status={project.status} />
            <ProjectHealthBadge health={project.health} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <UserAvatar name={managerName} size="sm" />
              <span>
                Manager: <span className="font-medium text-foreground">{managerName}</span>
              </span>
            </span>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil aria-hidden="true" /> Edit
              </Button>
            )}
            {hasMenuActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="More project actions">
                    <MoreHorizontal aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Project actions</DropdownMenuLabel>
                  {canSettings && (
                    <DropdownMenuItem onSelect={() => navigate(`/projects/${project.id}/settings`)}>
                      <Settings aria-hidden="true" /> Settings
                    </DropdownMenuItem>
                  )}
                  {canArchive && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={onArchive} className="text-danger focus:text-danger">
                        <Archive aria-hidden="true" /> Archive project
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
