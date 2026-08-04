import * as React from 'react'
import {
  Boxes,
  Bug as BugIcon,
  CalendarClock,
  Layers,
  ListChecks,
  Plus,
  SquareKanban,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { ErrorState } from '@/components/feedback/error-state'
import { formatDate, formatRelative } from '@/lib/formats'
import { usePlanning } from '@/store/planning'
import { PlanningLayout } from '../planning-layout'
import { EmptyPlanningState } from '../components/empty-planning-state'
import { IssueTypeBadge } from '../components/issue-type-badge'
import { StoryStatusBadge } from '../components/story-status-badge'
import { PriorityBadge } from '../components/priority-badge'
import { StoryPointsBadge } from '../components/story-points-badge'
import { AssigneeAvatar } from '../components/assignee-avatar-group'
import { StoryDetailDrawer } from '../components/stories/story-detail-drawer'
import { StoryForm } from '../components/stories/story-form'
import { SprintForm } from '../components/sprints/sprint-form'
import { SprintDetailDrawer } from '../components/sprints/sprint-detail-drawer'
import { BugForm } from '../components/bugs/bug-form'
import { BugDetailDrawer } from '../components/bugs/bug-detail-drawer'
import {
  usePlanningBacklog,
  usePlanningBugs,
  usePlanningEpics,
  usePlanningReleases,
  usePlanningStories,
  usePlanningSprints,
  usePlanningUsers,
  useStoryMutations,
} from '../planning-queries'
import type { Story } from '@/types/agile'
import type { Sprint } from '@/types/agile'
import type { Bug } from '@/types/agile'

const BREADCRUMB = [{ label: 'Planning' }]

// ---------------------------------------------------------------------------
// Shared filter controls
// ---------------------------------------------------------------------------

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

function SeverityFilters() {
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
        <option value="open">Open</option>
        <option value="assigned">Assigned</option>
        <option value="fixing">Fixing</option>
        <option value="ready_for_qa">Ready for QA</option>
        <option value="verified">Verified</option>
        <option value="closed">Closed</option>
      </select>
    </>
  )
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export function PlanningStoriesPage() {
  const projectId = usePlanning((s) => s.projectId)
  const search = usePlanning((s) => s.search)
  const filters = usePlanning((s) => s.filters)
  const storiesQuery = usePlanningStories(projectId, { search, filters })
  const epicsQuery = usePlanningEpics(projectId)
  const usersQuery = usePlanningUsers()

  const [selectedStory, setSelectedStory] = React.useState<Story | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)

  const epicMap = React.useMemo(() => new Map((epicsQuery.data ?? []).map((e) => [e.id, e.name])), [epicsQuery.data])

  const columns = React.useMemo<DataTableColumn<Story>[]>(
    () => [
      {
        id: 'key',
        header: 'Key',
        cell: (row) => <span className="font-mono text-[12px] font-medium text-foreground">{row.key}</span>,
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
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{row.tags.join(', ')}</p>
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
          return name ? <span className="truncate text-[13px] text-foreground">{name}</span> : <span className="text-[13px] text-muted-foreground">—</span>
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
        sortValue: (row) => usersQuery.data?.find((u) => u.id === row.assigneeId)?.name ?? '',
        searchValue: (row) => usersQuery.data?.find((u) => u.id === row.assigneeId)?.name,
        className: 'w-36',
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        cell: (row) => <span className="whitespace-nowrap text-[13px] text-muted-foreground">{formatRelative(row.updatedAt)}</span>,
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
      title="Stories"
      description="Create and groom stories, tasks, and subtasks."
      breadcrumb={[...BREADCRUMB, { label: 'Stories' }]}
      filters={<PlanningFilters />}
      actions={
        projectIdSelected ? (
          <Button onClick={() => setFormOpen(true)}>
            <Plus aria-hidden="true" /> New story
          </Button>
        ) : undefined
      }
    >
      {!projectIdSelected ? (
        <EmptyPlanningState icon={Target} title="Select a project" description="Choose a project from the toolbar to view stories." />
      ) : storiesQuery.isError ? (
        <ErrorState
          title="Could not load stories"
          description={storiesQuery.error instanceof Error ? storiesQuery.error.message : 'Something went wrong.'}
          onRetry={() => storiesQuery.refetch()}
        />
      ) : (
        <DataTable<Story>
          data={storiesQuery.data?.items ?? []}
          columns={columns}
          keyField={(row) => row.id}
          loading={storiesQuery.isLoading}
          onRowClick={(row) => { setSelectedStory(row); setDrawerOpen(true) }}
          toolbar={{
            actions: (
              <span className="text-[13px] text-muted-foreground">
                {storiesQuery.data?.total ?? 0} stories
              </span>
            ),
          }}
          pagination={{ pageSize: 15 }}
          empty={{
            icon: Target,
            title: 'No stories yet',
            description: 'Create your first story to start tracking work.',
            action: { label: 'New story', onClick: () => setFormOpen(true), icon: Plus },
          }}
        />
      )}

      <StoryDetailDrawer story={selectedStory} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <StoryForm open={formOpen} onClose={() => setFormOpen(false)} />
    </PlanningLayout>
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

  const [selectedStory, setSelectedStory] = React.useState<Story | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const epicMap = React.useMemo(() => new Map((epicsQuery.data ?? []).map((e) => [e.id, e.name])), [epicsQuery.data])

  const columns = React.useMemo<DataTableColumn<Story>[]>(
    () => [
      {
        id: 'key',
        header: 'Key',
        cell: (row) => <span className="font-mono text-[12px] font-medium text-foreground">{row.key}</span>,
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
            {row.tags.length > 0 && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{row.tags.join(', ')}</p>}
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
          return name ? <span className="truncate text-[13px] text-foreground">{name}</span> : <span className="text-[13px] text-muted-foreground">—</span>
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
        sortValue: (row) => usersQuery.data?.find((u) => u.id === row.assigneeId)?.name ?? '',
        searchValue: (row) => usersQuery.data?.find((u) => u.id === row.assigneeId)?.name,
        className: 'w-36',
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        cell: (row) => <span className="whitespace-nowrap text-[13px] text-muted-foreground">{formatRelative(row.updatedAt)}</span>,
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
        <EmptyPlanningState icon={ListChecks} title="Select a project" description="Choose a project from the toolbar above to view its backlog." />
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
          onRowClick={(row) => { setSelectedStory(row); setDrawerOpen(true) }}
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
            description: filters.status || filters.priority
              ? 'No stories match your current filters. Try adjusting or clearing them.'
              : 'All stories have been assigned to sprints, or none have been created yet.',
          }}
        />
      )}

      <StoryDetailDrawer story={selectedStory} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </PlanningLayout>
  )
}

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------

const BOARD_COLUMNS: Array<{ status: Story['status']; label: string; color: string }> = [
  { status: 'todo', label: 'Todo', color: '#6B7280' },
  { status: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { status: 'in_review', label: 'In Review', color: '#F59E0B' },
  { status: 'qa', label: 'QA', color: '#8B5CF6' },
  { status: 'done', label: 'Done', color: '#10B981' },
]

export function PlanningBoardPage() {
  const projectId = usePlanning((s) => s.projectId)
  const search = usePlanning((s) => s.search)
  const filters = usePlanning((s) => s.filters)
  const storiesQuery = usePlanningStories(projectId, { search, filters })
  const storyMutations = useStoryMutations()

  const [selectedStory, setSelectedStory] = React.useState<Story | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  // Group stories by status
  const storiesByStatus = React.useMemo(() => {
    const grouped: Record<string, Story[]> = {}
    for (const col of BOARD_COLUMNS) grouped[col.status] = []
    for (const story of storiesQuery.data?.items ?? []) {
      if (grouped[story.status]) grouped[story.status].push(story)
    }
    return grouped
  }, [storiesQuery.data])

  // Simple HTML5 drag-and-drop
  const [dragId, setDragId] = React.useState<string | null>(null)

  const handleDragStart = (storyId: string) => setDragId(storyId)

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = (targetStatus: Story['status']) => {
    if (!dragId) return
    const story = (storiesQuery.data?.items ?? []).find((s) => s.id === dragId)
    if (story && story.status !== targetStatus) {
      storyMutations.move.mutate({ id: dragId, status: targetStatus })
    }
    setDragId(null)
  }

  const projectIdSelected = Boolean(projectId)

  return (
    <PlanningLayout
      title="Board"
      description="Drag-and-drop kanban board for the active sprint."
      breadcrumb={[...BREADCRUMB, { label: 'Board' }]}
      filters={<PlanningFilters />}
    >
      {!projectIdSelected ? (
        <EmptyPlanningState icon={SquareKanban} title="Select a project" description="Choose a project from the toolbar to view the board." />
      ) : storiesQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-[13px] text-muted-foreground">Loading board…</span>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map((col) => (
            <div
              key={col.status}
              className="flex min-w-[220px] flex-1 flex-col rounded-2xl border border-border bg-surface-subtle p-3"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.status)}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-block size-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-[13px] font-medium text-foreground">{col.label}</span>
                <Badge variant="neutral" className="ml-auto text-[11px]">
                  {storiesByStatus[col.status]?.length ?? 0}
                </Badge>
              </div>
              <div className="space-y-2">
                {(storiesByStatus[col.status] ?? []).map((story) => (
                  <div
                    key={story.id}
                    draggable
                    onDragStart={() => handleDragStart(story.id)}
                    onClick={() => { setSelectedStory(story); setDrawerOpen(true) }}
                    className="cursor-grab rounded-xl border border-border bg-surface p-3 shadow-xs transition-shadow hover:shadow-md active:cursor-grabbing"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground">{story.key}</span>
                      <StoryPointsBadge points={story.points} className="size-5 text-[10px]" />
                    </div>
                    <p className="mb-2 text-[13px] font-medium text-foreground line-clamp-2">{story.title}</p>
                    <div className="flex items-center justify-between">
                      <PriorityBadge priority={story.priority} className="text-[10px]" />
                      <AssigneeAvatar userId={story.assigneeId} size="xs" />
                    </div>
                  </div>
                ))}
                {(storiesByStatus[col.status] ?? []).length === 0 && (
                  <p className="py-4 text-center text-[12px] text-muted-foreground">No stories</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <StoryDetailDrawer story={selectedStory} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </PlanningLayout>
  )
}

// ---------------------------------------------------------------------------
// Sprints
// ---------------------------------------------------------------------------

export function PlanningSprintsPage() {
  const projectId = usePlanning((s) => s.projectId)
  const sprintsQuery = usePlanningSprints(projectId)
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedSprint, setSelectedSprint] = React.useState<Sprint | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const projectIdSelected = Boolean(projectId)

  const SPRINT_STATUS_BADGE: Record<string, { tone: 'default' | 'info' | 'success' | 'warning' | 'neutral' }> = {
    planned: { tone: 'info' },
    active: { tone: 'success' },
    completed: { tone: 'neutral' },
  }

  return (
    <PlanningLayout
      title="Sprints"
      description="Plan, start, and close sprints with capacity and velocity."
      breadcrumb={[...BREADCRUMB, { label: 'Sprints' }]}
      actions={
        projectIdSelected ? (
          <Button onClick={() => setFormOpen(true)}>
            <Plus aria-hidden="true" /> New sprint
          </Button>
        ) : undefined
      }
    >
      {!projectIdSelected ? (
        <EmptyPlanningState icon={CalendarClock} title="Select a project" description="Choose a project from the toolbar to view sprints." />
      ) : sprintsQuery.isError ? (
        <ErrorState
          title="Could not load sprints"
          description={sprintsQuery.error instanceof Error ? sprintsQuery.error.message : 'Something went wrong.'}
          onRetry={() => sprintsQuery.refetch()}
        />
      ) : (sprintsQuery.data ?? []).length === 0 ? (
        <EmptyPlanningState icon={CalendarClock} title="No sprints yet" description="Create your first sprint to start planning work." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(sprintsQuery.data ?? []).map((sprint) => {
            const badge = SPRINT_STATUS_BADGE[sprint.status] ?? { tone: 'neutral' as const }
            const capacityPct = sprint.capacityHours > 0 ? Math.round((sprint.hoursLogged / sprint.capacityHours) * 100) : 0
            return (
              <div
                key={sprint.id}
                onClick={() => { setSelectedSprint(sprint); setDetailOpen(true) }}
                className="cursor-pointer rounded-2xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="truncate text-[14px] font-semibold text-foreground">{sprint.name}</h3>
                  <Badge variant={badge.tone} className="ml-auto">{sprint.status}</Badge>
                </div>
                {sprint.goal && <p className="mb-3 text-[12px] text-muted-foreground line-clamp-2">{sprint.goal}</p>}
                <div className="mb-2 grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-muted-foreground">Start</span>
                    <p className="text-foreground">{formatDate(sprint.startDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End</span>
                    <p className="text-foreground">{formatDate(sprint.endDate)}</p>
                  </div>
                </div>
                <div className="text-[12px]">
                  <div className="mb-1 flex justify-between text-muted-foreground">
                    <span>Capacity</span>
                    <span>{sprint.hoursLogged}h / {sprint.capacityHours}h</span>
                  </div>
                  <Progress value={capacityPct} className="h-1.5" />
                </div>
                <div className="mt-2 flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Velocity</span>
                  <span className="font-medium text-foreground">{sprint.velocity} pts</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <SprintForm open={formOpen} onClose={() => setFormOpen(false)} />
      <SprintDetailDrawer sprint={selectedSprint} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </PlanningLayout>
  )
}

// ---------------------------------------------------------------------------
// Bugs
// ---------------------------------------------------------------------------

const BUG_STATUS_CONFIG: Record<string, { label: string; tone: 'default' | 'info' | 'warning' | 'success' | 'danger' | 'neutral' }> = {
  open: { label: 'Open', tone: 'warning' },
  assigned: { label: 'Assigned', tone: 'info' },
  fixing: { label: 'Fixing', tone: 'info' },
  ready_for_qa: { label: 'Ready for QA', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
}

const SEVERITY_CONFIG: Record<string, { label: string; tone: 'danger' | 'warning' | 'info' | 'neutral' }> = {
  blocker: { label: 'Blocker', tone: 'danger' },
  critical: { label: 'Critical', tone: 'danger' },
  major: { label: 'Major', tone: 'warning' },
  minor: { label: 'Minor', tone: 'info' },
  trivial: { label: 'Trivial', tone: 'neutral' },
}

export function PlanningBugsPage() {
  const projectId = usePlanning((s) => s.projectId)
  const search = usePlanning((s) => s.search)
  const filters = usePlanning((s) => s.filters)
  const bugsQuery = usePlanningBugs(projectId, { search, filters })
  const usersQuery = usePlanningUsers()

  const [selectedBug, setSelectedBug] = React.useState<Bug | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)

  const columns = React.useMemo<DataTableColumn<Bug>[]>(
    () => [
      {
        id: 'key',
        header: 'Key',
        cell: (row) => <span className="font-mono text-[12px] font-medium text-foreground">{row.key}</span>,
        sortable: true,
        sortValue: (row) => row.key,
        searchValue: (row) => row.key,
        className: 'w-24',
        hideable: false,
      },
      {
        id: 'title',
        header: 'Title',
        cell: (row) => <p className="truncate text-[13px] font-medium text-foreground">{row.title}</p>,
        sortable: true,
        sortValue: (row) => row.title,
        searchValue: (row) => row.title,
        hideable: false,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => {
          const config = BUG_STATUS_CONFIG[row.status] ?? { label: row.status, tone: 'neutral' as const }
          return <Badge variant={config.tone}>{config.label}</Badge>
        },
        sortable: true,
        sortValue: (row) => row.status,
        className: 'w-28',
      },
      {
        id: 'severity',
        header: 'Severity',
        cell: (row) => {
          const config = SEVERITY_CONFIG[row.severity] ?? { label: row.severity, tone: 'neutral' as const }
          return <Badge variant={config.tone}>{config.label}</Badge>
        },
        sortable: true,
        sortValue: (row) => row.severity,
        className: 'w-24',
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
        sortValue: (row) => usersQuery.data?.find((u) => u.id === row.assigneeId)?.name ?? '',
        searchValue: (row) => usersQuery.data?.find((u) => u.id === row.assigneeId)?.name,
        className: 'w-36',
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        cell: (row) => <span className="whitespace-nowrap text-[13px] text-muted-foreground">{formatRelative(row.updatedAt)}</span>,
        sortable: true,
        sortValue: (row) => row.updatedAt,
        align: 'right',
        className: 'w-24',
      },
    ],
    [usersQuery.data],
  )

  const projectIdSelected = Boolean(projectId)

  return (
    <PlanningLayout
      title="Bugs"
      description="Track, triage, and resolve defects."
      breadcrumb={[...BREADCRUMB, { label: 'Bugs' }]}
      filters={<SeverityFilters />}
      actions={
        projectIdSelected ? (
          <Button onClick={() => setFormOpen(true)}>
            <Plus aria-hidden="true" /> Report bug
          </Button>
        ) : undefined
      }
    >
      {!projectIdSelected ? (
        <EmptyPlanningState icon={BugIcon} title="Select a project" description="Choose a project from the toolbar to view bugs." />
      ) : bugsQuery.isError ? (
        <ErrorState
          title="Could not load bugs"
          description={bugsQuery.error instanceof Error ? bugsQuery.error.message : 'Something went wrong.'}
          onRetry={() => bugsQuery.refetch()}
        />
      ) : (
        <DataTable<Bug>
          data={bugsQuery.data?.items ?? []}
          columns={columns}
          keyField={(row) => row.id}
          loading={bugsQuery.isLoading}
          onRowClick={(row) => { setSelectedBug(row); setDrawerOpen(true) }}
          toolbar={{
            actions: (
              <span className="text-[13px] text-muted-foreground">
                {bugsQuery.data?.total ?? 0} bugs
              </span>
            ),
          }}
          pagination={{ pageSize: 15 }}
          empty={{
            icon: BugIcon,
            title: 'No bugs yet',
            description: 'Report your first bug to start tracking defects.',
            action: { label: 'Report bug', onClick: () => setFormOpen(true), icon: Plus },
          }}
        />
      )}

      <BugDetailDrawer bug={selectedBug} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <BugForm open={formOpen} onClose={() => setFormOpen(false)} />
    </PlanningLayout>
  )
}

// ---------------------------------------------------------------------------
// Epics
// ---------------------------------------------------------------------------

export function PlanningEpicsPage() {
  const projectId = usePlanning((s) => s.projectId)
  const epicsQuery = usePlanningEpics(projectId)
  const projectIdSelected = Boolean(projectId)

  return (
    <PlanningLayout
      title="Epics"
      description="Group large bodies of work spanning multiple sprints."
      breadcrumb={[...BREADCRUMB, { label: 'Epics' }]}
    >
      {!projectIdSelected ? (
        <EmptyPlanningState icon={Layers} title="Select a project" description="Choose a project from the toolbar to view epics." />
      ) : epicsQuery.isError ? (
        <ErrorState
          title="Could not load epics"
          description={epicsQuery.error instanceof Error ? epicsQuery.error.message : 'Something went wrong.'}
          onRetry={() => epicsQuery.refetch()}
        />
      ) : (epicsQuery.data ?? []).length === 0 ? (
        <EmptyPlanningState icon={Layers} title="No epics yet" description="Create epics to group related stories." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(epicsQuery.data ?? []).map((epic) => {
            const progress = epic.pointsTotal > 0 ? Math.round((epic.pointsDone / epic.pointsTotal) * 100) : 0
            return (
              <div
                key={epic.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ backgroundColor: epic.color }}
                  />
                  <span className="font-mono text-[11px] text-muted-foreground">{epic.key}</span>
                </div>
                <h3 className="mb-1 truncate text-[14px] font-semibold text-foreground">{epic.name}</h3>
                <p className="mb-3 text-[12px] text-muted-foreground line-clamp-2">{epic.summary}</p>
                <div className="mb-2 flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
                <div className="mt-2 flex justify-between text-[12px] text-muted-foreground">
                  <span>{epic.pointsDone}/{epic.pointsTotal} pts</span>
                  <span>{epic.storyCount} stories</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PlanningLayout>
  )
}

// ---------------------------------------------------------------------------
// Releases
// ---------------------------------------------------------------------------

const RELEASE_STATUS_CONFIG: Record<string, { label: string; tone: 'default' | 'info' | 'success' | 'warning' | 'neutral' }> = {
  planned: { label: 'Planned', tone: 'info' },
  in_progress: { label: 'In progress', tone: 'success' },
  released: { label: 'Released', tone: 'neutral' },
  deferred: { label: 'Deferred', tone: 'warning' },
}

export function PlanningReleasesPage() {
  const projectId = usePlanning((s) => s.projectId)
  const releasesQuery = usePlanningReleases(projectId)
  const projectIdSelected = Boolean(projectId)

  return (
    <PlanningLayout
      title="Releases"
      description="Plan releases and track version scope."
      breadcrumb={[...BREADCRUMB, { label: 'Releases' }]}
    >
      {!projectIdSelected ? (
        <EmptyPlanningState icon={Boxes} title="Select a project" description="Choose a project from the toolbar to view releases." />
      ) : releasesQuery.isError ? (
        <ErrorState
          title="Could not load releases"
          description={releasesQuery.error instanceof Error ? releasesQuery.error.message : 'Something went wrong.'}
          onRetry={() => releasesQuery.refetch()}
        />
      ) : (releasesQuery.data ?? []).length === 0 ? (
        <EmptyPlanningState icon={Boxes} title="No releases yet" description="Create releases to plan version scope." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(releasesQuery.data ?? []).map((release) => {
            const badge = RELEASE_STATUS_CONFIG[release.status] ?? { label: release.status, tone: 'neutral' as const }
            return (
              <div
                key={release.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">{release.key}</span>
                  <Badge variant={badge.tone} className="ml-auto">{badge.label}</Badge>
                </div>
                <h3 className="mb-1 text-[14px] font-semibold text-foreground">{release.name}</h3>
                <p className="mb-1 text-[12px] text-muted-foreground">Version {release.version}</p>
                {release.description && <p className="mb-3 text-[12px] text-muted-foreground line-clamp-2">{release.description}</p>}
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-muted-foreground">Start</span>
                    <p className="text-foreground">{formatDate(release.startDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Release</span>
                    <p className="text-foreground">{release.releaseDate ? formatDate(release.releaseDate) : '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stories</span>
                    <p className="text-foreground">{release.scope.stories}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Points</span>
                    <p className="text-foreground">{release.scope.points}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PlanningLayout>
  )
}
