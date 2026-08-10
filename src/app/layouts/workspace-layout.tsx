import * as React from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useWorkspace } from '@/store/workspace'
import { projectService } from '@/services'
import { WORKSPACE_NAV, type WorkspaceNavGroup, type WorkspaceNavItem } from '@/config/workspace-navigation'
import { Breadcrumb } from '@/components/navigation/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Project Workspace shell (Level 2 navigation).
 * Reads the :projectId route param, scopes workspace + planning context to it,
 * renders workspace navigation and a content outlet. Lives inside the global
 * DashboardLayout so the global sidebar/header remain untouched.
 */
export function WorkspaceLayout() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projectId: ctxProjectId, setProjectId } = useWorkspace()

  React.useEffect(() => {
    if (projectId && projectId !== ctxProjectId) setProjectId(projectId)
  }, [projectId, ctxProjectId, setProjectId])

  const projectQuery = useQuery({
    queryKey: ['workspace', 'project', projectId],
    queryFn: () => projectService.get(projectId as string),
    enabled: Boolean(projectId),
  })

  const project = projectQuery.data

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Back + project identity */}
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/projects')}
          className="-ml-2 w-fit gap-1.5 px-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All projects
        </Button>

        <Breadcrumb
          items={[
            { label: 'Projects', to: '/projects' },
            { label: projectQuery.isLoading ? '…' : (project?.name ?? 'Project') },
          ]}
        />

        <div className="flex flex-wrap items-center gap-3">
          {projectQuery.isLoading ? (
            <Skeleton className="h-8 w-56 rounded-lg" />
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft font-mono text-[13px] font-semibold text-primary">
                {project?.key?.slice(0, 3)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {project?.name ?? 'Project'}
                  </h1>
                  <Badge variant="neutral" className="font-mono text-[10px]">
                    {project?.key}
                  </Badge>
                </div>
                <p className="truncate text-[12px] text-muted-foreground">
                  {project?.status ? project.status : ''} {project?.health ? `· ${project.health}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workspace navigation */}
      <div className="border-b border-border">
        <div className="flex gap-6 overflow-x-auto pb-3 scrollbar-none">
          {WORKSPACE_NAV.map((group) => (
            <NavGroup key={group.label} group={group} projectId={projectId ?? ''} />
          ))}
        </div>
      </div>

      {/* Content outlet */}
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}

function NavGroup({ group, projectId }: { group: WorkspaceNavGroup; projectId: string }) {
  return (
    <div className="flex items-center gap-6">
      <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted lg:inline">
        {group.label}
      </span>
      {group.items.map((item) => (
        <WorkspaceNavLink key={item.to} item={item} projectId={projectId} />
      ))}
    </div>
  )
}

function WorkspaceNavLink({ item, projectId }: { item: WorkspaceNavItem; projectId: string }) {
  const { pathname } = useLocation()
  const to = `/projects/${projectId}/${item.to}`
  const active = item.end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)

  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium transition-colors',
        active ? 'text-brand-700' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <item.icon className="size-[15px]" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  )
}