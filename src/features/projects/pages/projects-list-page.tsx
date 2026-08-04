import * as React from 'react'
import { useNavigate } from 'react-router'
import {
  Archive,
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
import { useProjectMutations, useProjects, useUserDirectory } from '../project-queries'
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

export function ProjectsListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = React.useState<ProjectFilters>(EMPTY_FILTERS)
  const [selected, setSelected] = React.useState<string[]>([])
  const [drawer, setDrawer] = React.useState<{ open: boolean; project: ProjectListItem | null }>({ open: false, project: null })
  const [confirm, setConfirm] = React.useState<{ type: 'archive' | 'delete'; ids: string[] } | null>(null)
  const mutations = useProjectMutations()

  const users = useUserDirectory()
  const projectsQuery = useProjects(filters)
  const allQuery = useProjects(EMPTY_FILTERS)

  const pendingBulk = mutations.bulkArchive.isPending || mutations.bulkRemove.isPending

  const clientOptions = React.useMemo(() => {
    const set = new Set<string>()
    for (const project of allQuery.data?.items ?? []) if (project.client) set.add(project.client)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [allQuery.data])

  const hasActiveFilters = Object.values(filters).some(Boolean)

  const openCreate = () => setDrawer({ open: true, project: null })
  const openEdit = (project: ProjectListItem) => setDrawer({ open: true, project })

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

  const columns = React.useMemo<DataTableColumn<ProjectListItem>[]>(
    () => [
      {
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
      },
      {
        id: 'client',
        header: 'Client',
        cell: (row) => <span className="text-[13px] text-foreground">{row.client ?? 'Internal'}</span>,
        sortable: true,
        sortValue: (row) => row.client ?? 'Internal',
        searchValue: (row) => row.client,
      },
      {
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
      },
      {
        id: 'team',
        header: 'Team',
        cell: (row) => (
          <AvatarStack people={row.memberUsers} size="xs" max={4} />
        ),
        sortable: true,
        sortValue: (row) => row.memberCount,
        searchValue: (row) => row.memberUsers.map((user) => user.name),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <ProjectStatusBadge status={row.status} />,
        sortable: true,
        sortValue: (row) => row.status,
      },
      {
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
      },
      {
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
      },
      {
        id: 'startDate',
        header: 'Start date',
        cell: (row) => <span className="whitespace-nowrap text-[13px] text-foreground">{formatDate(row.startDate)}</span>,
        sortable: true,
        sortValue: (row) => row.startDate,
      },
      {
        id: 'endDate',
        header: 'End date',
        cell: (row) => <span className="whitespace-nowrap text-[13px] text-foreground">{formatDate(row.endDate)}</span>,
        sortable: true,
        sortValue: (row) => row.endDate,
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        cell: (row) => <span className="whitespace-nowrap text-[13px] text-muted-foreground">{formatRelative(row.updatedAt)}</span>,
        sortable: true,
        sortValue: (row) => row.updatedAt,
        align: 'right',
      },
      {
        id: 'actions',
        header: '',
        cell: (row) => (
          <RowActions
            project={row}
            onEdit={() => openEdit(row)}
            onArchive={() => setConfirm({ type: 'archive', ids: [row.id] })}
            onDelete={() => setConfirm({ type: 'delete', ids: [row.id] })}
          />
        ),
        align: 'right',
        className: 'w-10',
        hideable: false,
      },
    ],
    [],
  )

  const filtersBar = (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Status"
          value={filters.status}
          options={PROJECT_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          placeholder="All statuses"
          onValueChange={(value) => setFilter('status', value || undefined)}
        />
        <FilterSelect
          label="Manager"
          value={filters.ownerId}
          options={users.users.map((user) => ({ value: user.id, label: user.name }))}
          placeholder="Any manager"
          onValueChange={(value) => setFilter('ownerId', value || undefined)}
        />
        <FilterSelect
          label="Client"
          value={filters.client}
          options={clientOptions.map((client) => ({ value: client, label: client }))}
          placeholder="Any client"
          onValueChange={(value) => setFilter('client', value || undefined)}
        />
        <FilterSelect
          label="Team"
          value={filters.memberId}
          options={users.users.map((user) => ({ value: user.id, label: user.name }))}
          placeholder="Any member"
          onValueChange={(value) => setFilter('memberId', value || undefined)}
        />
        <label className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">From</span>
          <input
            type="date"
            value={filters.startFrom ?? ''}
            onChange={(event) => setFilter('startFrom', event.target.value || undefined)}
            className="h-9 rounded-xl border border-input bg-surface px-3 text-[13px] text-foreground shadow-xs outline-none transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring dark:[color-scheme:dark]"
            aria-label="Start date from"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">To</span>
          <input
            type="date"
            value={filters.endBefore ?? ''}
            onChange={(event) => setFilter('endBefore', event.target.value || undefined)}
            className="h-9 rounded-xl border border-input bg-surface px-3 text-[13px] text-foreground shadow-xs outline-none transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-ring dark:[color-scheme:dark]"
            aria-label="End date before"
          />
        </label>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <PageLayout
      header={
        <PageHeader
          title="Projects"
          description="Plan and manage every delivery project across the organization."
          breadcrumb={[{ label: 'Projects' }]}
          actions={
            <Button onClick={openCreate}>
              <Plus aria-hidden="true" /> New project
            </Button>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirm({ type: 'archive', ids: selected })}
            loading={pendingBulk}
          >
            <Archive aria-hidden="true" /> Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-danger hover:text-danger"
            onClick={() => setConfirm({ type: 'delete', ids: selected })}
          >
            <Trash2 aria-hidden="true" /> Delete
          </Button>
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
          enableSelection
          selected={selected}
          onSelectedChange={setSelected}
          onRowClick={(row) => navigate(`/projects/${row.id}`)}
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
          empty={{
            icon: FolderKanban,
            title: 'No projects found',
            description: hasActiveFilters
              ? 'Try adjusting or clearing your filters.'
              : 'Create your first project to start tracking delivery.',
            action: hasActiveFilters
              ? undefined
              : { label: 'New project', onClick: openCreate, icon: Plus },
          }}
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

function RowActions({
  project,
  onEdit,
  onArchive,
  onDelete,
}: {
  project: ProjectListItem
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${project.name}`} onClick={(event) => event.stopPropagation()}>
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{project.name}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil aria-hidden="true" /> Edit project
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onArchive}>
          <Archive aria-hidden="true" /> Archive
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDelete} className="text-danger focus:text-danger">
          <Trash2 aria-hidden="true" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
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