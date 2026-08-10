import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { ProjectHealthBadge, ProjectStatusBadge } from '@/components/common/status-badge'
import { UserAvatar } from '@/components/common/user-avatar'
import { useSubProjectWorkspace } from './sub-project-workspace-context'

/**
 * Sub Project context header (LEVEL 3): establishes which sub-project the
 * workspace belongs to and who manages it, without duplicating content that
 * lives in workspace screens.
 */
export function SubProjectWorkspaceHeader() {
  const { projectId, projectName, subProject, members } = useSubProjectWorkspace()

  const ownerNames = subProject.ownerIds
    .map((id) => members.find((member) => member.userId === id)?.user.name)
    .filter(Boolean)

  return (
    <div className="flex flex-col gap-3">
      <Link
        to={`/projects/${projectId}/sub-projects`}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1.5 py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring-focus"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {projectName} · Sub Projects
      </Link>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{subProject.name}</h1>
            <Badge variant="outline" className="font-mono text-[11px]">
              {subProject.key}
            </Badge>
            <ProjectStatusBadge status={subProject.status} />
            <ProjectHealthBadge health={subProject.health} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="flex -space-x-1.5">
                {ownerNames.map((name, index) => (
                  <UserAvatar key={`${name}-${index}`} name={name as string} size="sm" className="ring-2 ring-surface" />
                ))}
              </span>
              <span>
                {ownerNames.length === 1 ? 'Manager:' : 'Managers:'}{' '}
                <span className="font-medium text-foreground">{ownerNames.join(', ') || 'Unassigned'}</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
