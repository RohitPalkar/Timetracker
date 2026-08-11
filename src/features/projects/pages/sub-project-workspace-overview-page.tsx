import * as React from 'react'
import { Boxes, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/feedback/empty-state'
import { ProjectHealthBadge, ProjectStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate } from '@/lib/formats'
import { PROJECT_ROLE_OPTIONS } from '../member-options'
import type { ProjectMemberRole } from '@/types'
import { useSubProjectWorkspace } from '../components/sub-project-workspace-context'

/**
 * Sub-project workspace overview — read-only summary of the sub-project,
 * sourced from the sub-project workspace context. The sub-project workspace
 * layout (via `SubProjectWorkspacePage`) already renders the breadcrumb,
 * header and level-3 navigation around this screen.
 */
export function SubProjectWorkspaceOverviewPage() {
  const { subProject, projectName, members, teams } = useSubProjectWorkspace()

  const roleLabel = React.useMemo(() => {
    const options = new Map(PROJECT_ROLE_OPTIONS.map((option) => [option.value, option.label]))
    return (role: ProjectMemberRole) => options.get(role) ?? role
  }, [])

  const ownerName = (ids: string[]) =>
    ids
      .map((id) => members.find((member) => member.userId === id)?.user.name)
      .filter(Boolean)
      .join(', ') || 'Unassigned'

  return (
    <div className="flex w-full flex-col gap-5">
      <PageHeader title={subProject.name} description={`${subProject.key} · ${projectName}`} />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-2">
                <ProjectStatusBadge status={subProject.status} />
                <ProjectHealthBadge health={subProject.health} />
              </div>
              {subProject.description && (
                <p className="text-[13px] text-muted-foreground">{subProject.description}</p>
              )}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-foreground">{subProject.progress}%</span>
                </div>
                <Progress value={subProject.progress} />
              </div>
              <dl className="grid grid-cols-1 gap-y-1.5 text-[13px]">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd className="text-foreground">{ownerName(subProject.ownerIds)}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Dates</dt>
                  <dd className="text-foreground">{formatDate(subProject.startDate)} – {formatDate(subProject.endDate)}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Budget</dt>
                  <dd className="font-medium text-foreground">
                    {formatCurrency(subProject.budget)}
                    {subProject.spent > 0 && (
                      <span className="ml-1.5 font-normal text-muted-foreground">{formatCurrency(subProject.spent)} spent</span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Boxes className="h-4 w-4 text-muted-foreground" /> Delivery Teams
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              {teams.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No delivery teams assigned yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {teams.map((team) => (
                    <li key={team.id} className="text-[13px] font-medium text-foreground">
                      {team.name}
                      <span className="ml-1.5 font-normal text-muted-foreground">({team.memberIds.length} members)</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-muted-foreground" /> Members
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              {members.length === 0 ? (
                <EmptyState compact icon={Users} title="No members" description="This sub-project has no members yet." />
              ) : (
                <ul className="flex flex-col gap-2">
                  {members.map((member) => (
                    <li key={member.id} className="flex items-center justify-between gap-2 text-[13px]">
                      <span className="font-medium text-foreground">{member.user.name}</span>
                      <span className="text-muted-foreground">{roleLabel(member.role)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
