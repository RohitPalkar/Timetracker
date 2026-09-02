import * as React from 'react'
import { useNavigate } from 'react-router'
import {
  Archive,
  ArrowUpRight,
  Download,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AvatarStack, UserAvatar } from '@/components/common/user-avatar'
import { ProjectStatusBadge } from '@/components/common/status-badge'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ErrorState } from '@/components/feedback/error-state'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatRelative } from '@/lib/formats'
import { pluralize } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import {
  DEMO_ACTOR_BY_PERSONA,
  PROJECT_PERSONAS,
  getProjectConfig,
  hasProjectCapability,
  type ProjectCapability,
  type ProjectListColumnId,
} from '@/config/project-config'
import type { ProjectStatus } from '@/types'
import type { DashboardPersona } from '@/types/dashboard'
import { useProjectMutations, useProjects, useUserDirectory, type ProjectListFilter } from '../project-queries'
import { ProjectFormDrawer } from '../components/project-form-drawer'
import { PROJECT_STATUS_OPTIONS } from '../project-form-schema'
import type { ProjectListItem } from '@/services'

interface ProjectFilters {
  status?: string
  ownerId?: string
  client?: string
  memberId?: string
  startFrom?: string
  endBefore?: string
}

const EMPTY_FILTERS: ProjectFilters = {}

interface ColumnHandlers {
  onEdit: (project: ProjectListItem) => void
  onArchive: (project: ProjectListItem) => void
  onDelete: (project: ProjectListItem) => void
  onOpen: (project: ProjectListItem) => void
  canEdit: boolean
  canArchive: boolean
  canDelete: boolean
}

export function ProjectsListPage() {
  const navigate = useNavigate()
  const { authUser } = useAuth()

  const [persona, setPersona] = React.useState<DashboardPersona>(() => personaForRole(authUser?.roleId))
  const config = getProjectConfig(persona)

  /**
   * Demo-phase actor for scope resolution. In the API phase the authenticated
   * user drives scope server-side; this maps the selected persona to a seeded
   * mock user so managed/assigned scope is observable.
   */
  const actorId = DEMO_ACTOR_BY_PERSONA[persona]

  const can = (capability: ProjectCapability) => hasProjectCapability(config, capability)
  const canCreate = can('projects.create')
  const canEdit = can('projects.edit')
  const canArchive = can('projects.archive')
  const canDelete = can('projects.delete')

  const [filters, setFilters] = React.useState<ProjectFilters>(EMPTY_FILTERS)
  const [selected, setSelected] = React.useState<string[]>([])
  const [drawer, setDrawer] = React.useState<{ open: boolean; project: ProjectListItem | null }>({ open: false, project: null })
  const [confirm, setConfirm] = React.useState<{ type: 'archive' | 'delete'; ids: string[] } | null>(null)
  const mutations = useProjectMutations()

  const users = useUserDirectory()

  /** Server-side filter set: status is mapped to `statuses`, plus permission scope. */
  const queryFilters = React.useMemo<ProjectListFilter>(() => {
    const { status, ...rest } = filters
    return {
      ...rest,
      statuses: status ? [status as ProjectStatus] : undefined,
      scope: config.scope,
      actorId,
    }
  }, [filters, config.scope, actorId])

  const projectsQuery = useProjects(queryFilters)

  const pendingBulk = mutations.bulkArchive.isPending || mutations.bulkRemove.isPending

  /** Client filter options are derived from the permitted scope only. */
  const clientOptions = React.useMemo(() => {
    const set = new Set<string>()
    for (const project of projectsQuery.data?.items ?? []) if (project.client) set.add(project.client)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [projectsQuery.data])

  const hasActiveFilters = Object.values(filters).some(Boolean)

  const openCreate = React.useCallback(() => setDrawer({ open: true, project: null }), [])
  const openEdit = React.useCallback((project: ProjectListItem) => setDrawer({ open: true, project }), [])
  const openWorkspace = React.useCallback((project: ProjectListItem) => navigate(`/projects/${project.id}`), [navigate])

  const handlePersonaChange = (value: string) => {
    setPersona(value as DashboardPersona)
    setFilters(EMPTY_FILTERS)
    setSelected([])
  }

  const setFilter = <K extends keyof ProjectFilters>(key: K, value: ProjectFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setSelected([])
  }

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    setSelected([])
  }

  const handleArchive = (ids: string[]) => {
    mutations.archive.mutate(ids[0], {
      onSuccess: () => {
        toast.success(`Project archived`)
        setSelected([])
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not archive project'),
    })
  }

  const handleBulkArchive = (ids: string[]) => {
    mutations.bulkArchive.mutate(ids, {
      onSuccess: (count) => {
        toast.success(pluralize(count, 'project') + ' archived')
        setSelected([])
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not archive projects'),
    })
  }

  const handleDelete = (ids: string[]) => {
    mutations.bulkRemove.mutate(ids, {
      onSuccess: (count) => {
        toast.success(pluralize(count, 'project') + ' deleted')
        setSelected([])
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not delete projects'),
    })
  }

  const onConfirm = () => {
    if (!confirm) return
    if (confirm.type === 'archive') {
      if (confirm.ids.length === 1) handleArchive(confirm.ids)
      else handleBulkArchive(confirm.ids)
    } else {
      handleDelete(confirm.ids)
    }
    setConfirm(null)
  }

  const columns = React.useMemo<DataTableColumn<ProjectListItem>[]>(() => {
    const handlers: ColumnHandlers = {
      onEdit: openEdit,
      onArchive: (project) => setConfirm({ type: 'archive', ids: [project.id] }),
      onDelete: (project) => setConfirm({ type: 'delete', ids: [project.id] }),
      onOpen: openWorkspace,
      canEdit,
      canArchive,
      canDelete,
    }
    return config.columns.map((columnId) => COLUMN_BUILDERS[columnId](handlers))
  }, [config, canEdit, canArchive, canDelete, openEdit, openWorkspace])

  const filtersBar = (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        {config.filters.status && (
          <FilterSelect
            label="Status"
            value={filters.status}
            options={PROJECT_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            placeholder="All statuses"
            onValueChange={(value) => setFilter('status', value || undefined)}
          />
        )}
        {config.filters.manager && (
          <FilterSelect
            label="Manager"
            value={filters.ownerId}
            options={users.users.map((user) => ({ value: user.id, label: user.name }))}
            placeholder="Any manager"
            onValueChange={(value) => setFilter('ownerId', value || undefined)}
          />
        )}
        {config.filters.client && (
          <FilterSelect
            label="Client"
            value={filters.client}
            options={clientOptions.map((client) => ({ value: client, label: client }))}
            placeholder="Any client"
            onValueChange={(value) => setFilter('client', value || undefined)}
          />
        )}
        {config.filters.member && (
          <FilterSelect
            label="Team"
            value={filters.memberId}
            options={users.users.map((user) => ({ value: user.id, label: user.name }))}
            placeholder="Any member"
            onValueChange={(value) => setFilter('memberId', value || undefined)}
          />
        )}
        {config.filters.dateFrom && (
          <label className="flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground">From</span>
            <input
              type="date"
              value={filters.startFrom ?? ''}
              onChange={(event) => setFilter('startFrom', event.target.value || undefined)}
              className="h-9 rounded-xl border border-input bg-surface px-3 text-[13px] text-foreground shadow-xs outline-none transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring"
              aria-label="Start date from"
            />
          </label>
        )}
        {config.filters.dateTo && (
          <label className="flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground">To</span>
            <input
              type="date"
              value={filters.endBefore ?? ''}
              onChange={(event) => setFilter('endBefore', event.target.value || undefined)}
              className="h-9 rounded-xl border border-input bg-surface px-3 text-[13px] text-foreground shadow-xs outline-none transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring"
              aria-label="End date before"
            />
          </label>
        )}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )

  const emptyState = React.useMemo(() => {
    const scopedEmpty = (projectsQuery.data?.scopeTotal ?? 0) === 0
    if (scopedEmpty) {
      return {
        icon: FolderKanban,
        title: config.scope === 'organization' ? 'No projects yet' : 'No projects are assigned to you',
        description:
          config.scope === 'organization'
            ? 'Create your first project to start tracking delivery.'
            : 'Projects you can access will appear here.',
        action: canCreate ? { label: 'New project', onClick: openCreate, icon: Plus } : undefined,
      }
    }
    return {
      icon: FolderKanban,
      title: hasActiveFilters ? 'No projects match your filters' : 'No projects found',
      description: hasActiveFilters ? 'Try adjusting or clearing your filters.' : undefined,
      action: undefined,
    }
  }, [projectsQuery.data, config.scope, hasActiveFilters, canCreate, openCreate])

  return (
    <PageLayout
      header={
        <PageHeader
          title="Projects"
          description={config.description}
          breadcrumb={[{ label: 'Projects' }]}
          actions={
            <>
              <Select value={persona} onValueChange={handlePersonaChange}>
                <SelectTrigger className="w-[170px]" aria-label="Project persona">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PROJECT_PERSONAS).map((personaConfig) => (
                    <SelectItem key={personaConfig.persona} value={personaConfig.persona}>
                      {personaConfig.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canCreate && (
                <Button onClick={openCreate}>
                  <Plus aria-hidden="true" /> New project
                </Button>
              )}
            </>
          }
        />
      }
      filters={filtersBar}
    >
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-xs">
          <p className="text-[13px] text-foreground">
            <span className="font-semibold">{selected.length}</span> selected
          </p>
          <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          {canArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirm({ type: 'archive', ids: selected })}
              loading={pendingBulk}
            >
              <Archive aria-hidden="true" /> Archive
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-danger hover:text-danger"
              onClick={() => setConfirm({ type: 'delete', ids: selected })}
            >
              <Trash2 aria-hidden="true" /> Delete
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info(`Export for ${selected.length} projects is ready in the API phase.`)}
          >
            <Download aria-hidden="true" /> Export
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      )}

      {projectsQuery.isError ? (
        <ErrorState
          title="Could not load projects"
          description={projectsQuery.error instanceof Error ? projectsQuery.error.message : 'Something went wrong.'}
          onRetry={() => projectsQuery.refetch()}
        />
      ) : (
        <DataTable<ProjectListItem>
          data={projectsQuery.data?.items ?? []}
          columns={columns}
          keyField={(row) => row.id}
          loading={projectsQuery.isLoading}
          enableSelection={canArchive}
          selected={selected}
          onSelectedChange={setSelected}
          onRowClick={openWorkspace}
          toolbar={{
            search: {
              value: '',
              onValueChange: () => {},
              placeholder: 'Search projects…',
            },
            actions: !projectsQuery.isLoading && projectsQuery.data?.items.length === 0 ? undefined : (
              <span className="text-[13px] text-muted-foreground">
                {projectsQuery.data?.total ?? 0} projects
              </span>
            ),
          }}
          pagination={{ pageSize: 10 }}
          empty={emptyState}
        />
      )}

      <ProjectFormDrawer
        open={drawer.open}
        onOpenChange={(open) => setDrawer((current) => ({ ...current, open }))}
        project={drawer.project}
        users={users.users}
      />

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.ids.length === 1 ? `${confirm?.type === 'archive' ? 'Archive' : 'Delete'} project?` : `${confirm?.type === 'archive' ? 'Archive' : 'Delete'} ${confirm?.ids.length ?? 0} projects?`}
        description={
          confirm?.type === 'archive'
            ? 'Archived projects are hidden from active views but preserved.'
            : 'This permanently removes the selected projects and their data.'
        }
        confirmLabel={confirm?.type === 'archive' ? 'Archive' : 'Delete'}
        destructive={confirm?.type === 'delete'}
        loading={pendingBulk}
        onConfirm={onConfirm}
      />
    </PageLayout>
  )
}

function RowActions({ project, handlers }: { project: ProjectListItem; handlers: ColumnHandlers }) {
  const hasAdminActions = handlers.canEdit || handlers.canArchive || handlers.canDelete

  if (!hasAdminActions) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Open ${project.name}`}
        onClick={(event) => {
          event.stopPropagation()
          handlers.onOpen(project)
        }}
      >
        <ArrowUpRight aria-hidden="true" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${project.name}`} onClick={(event) => event.stopPropagation()}>
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{project.name}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => handlers.onOpen(project)}>
          <ArrowUpRight aria-hidden="true" /> Open workspace
        </DropdownMenuItem>
        {handlers.canEdit && (
          <DropdownMenuItem onSelect={() => handlers.onEdit(project)}>
            <Pencil aria-hidden="true" /> Edit project
          </DropdownMenuItem>
        )}
        {handlers.canArchive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handlers.onArchive(project)}>
              <Archive aria-hidden="true" /> Archive
            </DropdownMenuItem>
          </>
        )}
        {handlers.canDelete && (
          <DropdownMenuItem onSelect={() => handlers.onDelete(project)} className="text-danger focus:text-danger">
            <Trash2 aria-hidden="true" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const COLUMN_BUILDERS: Record<ProjectListColumnId, (handlers: ColumnHandlers) => DataTableColumn<ProjectListItem>> = {
  project: () => ({
    id: 'project',
    header: 'Project',
    cell: (row) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{row.name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{row.key}</p>
      </div>
    ),
    sortable: true,
    sortValue: (row) => row.name,
    searchValue: (row) => [row.name, row.key, row.description],
    hideable: false,
  }),
  client: () => ({
    id: 'client',
    header: 'Client',
    cell: (row) => <span className="text-[13px] text-foreground">{row.client ?? 'Internal'}</span>,
    sortable: true,
    sortValue: (row) => row.client ?? 'Internal',
    searchValue: (row) => row.client,
  }),
  manager: () => ({
    id: 'manager',
    header: 'Manager',
    cell: (row) => (
      <span className="flex items-center gap-2">
        <UserAvatar name={row.managerName} size="xs" />
        <span className="text-[13px] text-foreground">{row.managerName}</span>
      </span>
    ),
    sortable: true,
    sortValue: (row) => row.managerName,
    searchValue: (row) => row.managerName,
  }),
  team: () => ({
    id: 'team',
    header: 'Team',
    cell: (row) => <AvatarStack people={row.memberUsers} size="xs" max={4} />,
    sortable: true,
    sortValue: (row) => row.memberCount,
    searchValue: (row) => row.memberUsers.map((user) => user.name),
  }),
  status: () => ({
    id: 'status',
    header: 'Status',
    cell: (row) => <ProjectStatusBadge status={row.status} />,
    sortable: true,
    sortValue: (row) => row.status,
  }),
  budget: () => ({
    id: 'budget',
    header: 'Budget',
    cell: (row) => (
      <div className="text-right">
        <p className="text-[13px] font-medium text-foreground">{formatCurrency(row.budget)}</p>
        {row.spent > 0 && <p className="text-[11px] text-muted-foreground">{formatCurrency(row.spent)} spent</p>}
      </div>
    ),
    sortable: true,
    sortValue: (row) => row.budget,
    align: 'right',
    className: 'min-w-28',
  }),
  progress: () => ({
    id: 'progress',
    header: 'Progress',
    cell: (row) => (
      <div className="flex w-24 items-center gap-2">
        <Progress value={row.progress} className="flex-1" />
        <span className="w-8 text-right text-[12px] font-medium text-foreground">{row.progress}%</span>
      </div>
    ),
    sortable: true,
    sortValue: (row) => row.progress,
  }),
  startDate: () => ({
    id: 'startDate',
    header: 'Start date',
    cell: (row) => <span className="whitespace-nowrap text-[13px] text-foreground">{formatDate(row.startDate)}</span>,
    sortable: true,
    sortValue: (row) => row.startDate,
  }),
  endDate: () => ({
    id: 'endDate',
    header: 'End date',
    cell: (row) => <span className="whitespace-nowrap text-[13px] text-foreground">{formatDate(row.endDate)}</span>,
    sortable: true,
    sortValue: (row) => row.endDate,
  }),
  updatedAt: () => ({
    id: 'updatedAt',
    header: 'Updated',
    cell: (row) => <span className="whitespace-nowrap text-[13px] text-muted-foreground">{formatRelative(row.updatedAt)}</span>,
    sortable: true,
    sortValue: (row) => row.updatedAt,
    align: 'right',
  }),
  actions: (handlers) => ({
    id: 'actions',
    header: '',
    cell: (row) => <RowActions project={row} handlers={handlers} />,
    align: 'right',
    className: 'w-10',
    hideable: false,
  }),
}

function FilterSelect({
  label,
  value,
  options,
  placeholder,
  onValueChange,
}: {
  label: string
  value?: string
  options: Array<{ value: string; label: string }>
  placeholder: string
  onValueChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)
  return (
    <label className="flex items-center gap-2">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <Select value={value ?? ''} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 w-44" aria-label={label}>
          <SelectValue placeholder={placeholder}>
            {selected ? (
              <span className="flex items-center gap-2">
                <Badge variant="neutral" className="text-[10px]">{label}</Badge>
                {selected.label}
              </span>
            ) : (
              placeholder
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}
