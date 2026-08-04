import * as React from 'react'
import { Boxes, Bug, CalendarClock, Layers, ListChecks, SquareKanban, Target } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { ErrorState } from '@/components/feedback/error-state'
import { formatRelative } from '@/lib/formats'
import { usePlanning } from '@/store/planning'
import { PlanningLayout } from '../planning-layout'
import { EmptyPlanningState } from '../components/empty-planning-state'
import { IssueTypeBadge } from '../components/issue-type-badge'
import { StoryStatusBadge } from '../components/story-status-badge'
import { PriorityBadge } from '../components/priority-badge'
import { StoryPointsBadge } from '../components/story-points-badge'
import { AssigneeAvatar } from '../components/assignee-avatar-group'
import { usePlanningBacklog, usePlanningEpics, usePlanningUsers } from '../planning-queries'
import type { Story } from '@/types/agile'

const BREADCRUMB = [{ label: 'Planning' }]

/** Shared status/priority filter selects wired to the planning store. */
function PlanningFilters() {
  const setFilter = usePlanning((state) => state.setFilter)
  const filters = usePlanning((state) => state.filters)
  return (
    <>
      <select
        value={filters.status ?? ''}
        onChange={(event) => setFilter('status', event.target.value || undefined)}
        className="h-9 rounded-xl border border-input bg-surface px-2.5 text-[13px] text-foreground outline-none"
        aria-label="Status"
      >
        <option value="">Status</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In progress</option>
        <option value="in_review">In review</option>
        <option value="qa">QA</option>
        <option value="done">Done</option>
      </select>
      <select
        value={filters.priority ?? ''}
        onChange={(event) => setFilter('priority', event.target.value || undefined)}
        className="h-9 rounded-xl border border-input bg-surface px-2.5 text-[13px] text-foreground outline-none"
        aria-label="Priority"
      >
        <option value="">Priority</option>
        <option value="highest">Highest</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
        <option value="lowest">Lowest</option>
      </select>
    </>
  )
}

// ---------------------------------------------------------------------------
// Backlog
// ---------------------------------------------------------------------------

export function PlanningBacklogPage() {
  const projectId = usePlanning((s) => s.projectId)
  const search = usePlanning((s) => s.search)
  const filters = usePlanning((s) => s.filters)
  const backlogQuery = usePlanningBacklog(projectId, { search, filters })
  const epicsQuery = usePlanningEpics(projectId)
  const usersQuery = usePlanningUsers()

  const epicMap = React.useMemo(() => new Map((epicsQuery.data ?? []).map((e) => [e.id, e.name])), [epicsQuery.data])

  const columns = React.useMemo<DataTableColumn<Story>[]>(
    () => [
      {
        id: 'key',
        header: 'Key',
        cell: (row) => (
          <span className="font-mono text-[12px] font-medium text-foreground">{row.key}</span>
        ),
        sortable: true,
        sortValue: (row) => row.key,
        searchValue: (row) => row.key,
        className: 'w-24',
        hideable: false,
      },
      {
        id: 'type',
        header: 'Type',
        cell: (row) => <IssueTypeBadge type={row.storyType} />,
        sortable: true,
        sortValue: (row) => row.storyType,
        className: 'w-20',
      },
      {
        id: 'title',
        header: 'Title',
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{row.title}</p>
            {row.tags.length > 0 && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {row.tags.join(', ')}
              </p>
            )}
          </div>
        ),
        sortable: true,
        sortValue: (row) => row.title,
        searchValue: (row) => [row.title, ...row.tags],
        hideable: false,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <StoryStatusBadge status={row.status} />,
        sortable: true,
        sortValue: (row) => row.status,
        className: 'w-28',
      },
      {
        id: 'priority',
        header: 'Priority',
        cell: (row) => <PriorityBadge priority={row.priority} />,
        sortable: true,
        sortValue: (row) => row.priority,
        className: 'w-24',
      },
      {
        id: 'points',
        header: 'Pts',
        cell: (row) => <StoryPointsBadge points={row.points} />,
        sortable: true,
        sortValue: (row) => row.points,
        align: 'center',
        className: 'w-12',
      },
      {
        id: 'epic',
        header: 'Epic',
        cell: (row) => {
          const name = row.epicId ? epicMap.get(row.epicId) : null
          return name ? (
            <span className="truncate text-[13px] text-foreground">{name}</span>
          ) : (
            <span className="text-[13px] text-muted-foreground">—</span>
          )
        },
        sortable: true,
        sortValue: (row) => (row.epicId ? epicMap.get(row.epicId) ?? '' : ''),
        searchValue: (row) => (row.epicId ? epicMap.get(row.epicId) : undefined),
        className: 'w-36',
      },
      {
        id: 'assignee',
        header: 'Assignee',
        cell: (row) => (
          <span className="flex items-center gap-2">
            <AssigneeAvatar userId={row.assigneeId} size="xs" />
            <span className="text-[13px] text-foreground">
              {usersQuery.data?.find((u) => u.id === row.assigneeId)?.name ?? '—'}
            </span>
          </span>
        ),
        sortable: true,
        sortValue: (row) => {
          const name = usersQuery.data?.find((u) => u.id === row.assigneeId)?.name
          return name ?? ''
        },
        searchValue: (row) => usersQuery.data?.find((u) => u.id === row.assigneeId)?.name,
        className: 'w-36',
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        cell: (row) => (
          <span className="whitespace-nowrap text-[13px] text-muted-foreground">
            {formatRelative(row.updatedAt)}
          </span>
        ),
        sortable: true,
        sortValue: (row) => row.updatedAt,
        align: 'right',
        className: 'w-24',
      },
    ],
    [epicMap, usersQuery.data],
  )

  const projectIdSelected = Boolean(projectId)

  return (
    <PlanningLayout
      title="Backlog"
      description="Prioritize and refine stories, tasks, and bugs before sprint planning."
      breadcrumb={[...BREADCRUMB, { label: 'Backlog' }]}
      filters={<PlanningFilters />}
    >
      {!projectIdSelected ? (
        <EmptyPlanningState
          icon={ListChecks}
          title="Select a project"
          description="Choose a project from the toolbar above to view its backlog."
        />
      ) : backlogQuery.isError ? (
        <ErrorState
          title="Could not load backlog"
          description={backlogQuery.error instanceof Error ? backlogQuery.error.message : 'Something went wrong.'}
          onRetry={() => backlogQuery.refetch()}
        />
      ) : (
        <DataTable<Story>
          data={backlogQuery.data?.items ?? []}
          columns={columns}
          keyField={(row) => row.id}
          loading={backlogQuery.isLoading}
          onRowClick={(row) => {
            // Placeholder — story detail drawer lands in the Stories phase
            window.location.href = `/planning/stories?selected=${row.key}`
          }}
          toolbar={{
            actions: (
              <span className="text-[13px] text-muted-foreground">
                {backlogQuery.data?.total ?? 0} stories in backlog
              </span>
            ),
          }}
          pagination={{ pageSize: 15 }}
          empty={{
            icon: ListChecks,
            title: 'Backlog is empty',
            description:
              filters.status || filters.priority
                ? 'No stories match your current filters. Try adjusting or clearing them.'
                : 'All stories have been assigned to sprints, or none have been created yet.',
          }}
        />
      )}
    </PlanningLayout>
  )
}

// ---------------------------------------------------------------------------
// Placeholder pages (will be built in their respective phases)
// ---------------------------------------------------------------------------

export function PlanningBoardPage() {
  return (
    <PlanningLayout
      title="Board"
      description="Drag-and-drop kanban board for the active sprint."
      breadcrumb={[...BREADCRUMB, { label: 'Board' }]}
      filters={<PlanningFilters />}
    >
      <EmptyPlanningState
        icon={SquareKanban}
        title="Board is empty"
        description="The kanban board lands with the Sprints module. Column workflows and drag-and-drop come next."
      />
    </PlanningLayout>
  )
}

export function PlanningSprintsPage() {
  return (
    <PlanningLayout
      title="Sprints"
      description="Plan, start, and close sprints with capacity and velocity."
      breadcrumb={[...BREADCRUMB, { label: 'Sprints' }]}
    >
      <EmptyPlanningState
        icon={CalendarClock}
        title="No sprints yet"
        description="Sprint planning, capacity tracking, and burndown land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningStoriesPage() {
  return (
    <PlanningLayout
      title="Stories"
      description="Create and groom stories, tasks, and subtasks."
      breadcrumb={[...BREADCRUMB, { label: 'Stories' }]}
      filters={<PlanningFilters />}
    >
      <EmptyPlanningState
        icon={Target}
        title="No stories yet"
        description="Story creation, estimates, acceptance criteria, and comments land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningBugsPage() {
  return (
    <PlanningLayout
      title="Bugs"
      description="Track, triage, and resolve defects."
      breadcrumb={[...BREADCRUMB, { label: 'Bugs' }]}
      filters={<PlanningFilters />}
    >
      <EmptyPlanningState
        icon={Bug}
        title="No bugs yet"
        description="Bug triage, severity tracking, and the QA workflow land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningEpicsPage() {
  return (
    <PlanningLayout
      title="Epics"
      description="Group large bodies of work spanning multiple sprints."
      breadcrumb={[...BREADCRUMB, { label: 'Epics' }]}
    >
      <EmptyPlanningState
        icon={Layers}
        title="No epics yet"
        description="Epic portfolios, progress rollups, and dependency views land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningReleasesPage() {
  return (
    <PlanningLayout
      title="Releases"
      description="Plan releases and track version scope."
      breadcrumb={[...BREADCRUMB, { label: 'Releases' }]}
    >
      <EmptyPlanningState
        icon={Boxes}
        title="No releases yet"
        description="Release planning, version scope, and readiness checks land in the next phase."
      />
    </PlanningLayout>
  )
}
