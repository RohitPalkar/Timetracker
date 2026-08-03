import * as React from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Columns3,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { EmptyState, type EmptyStateProps } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { cn, pluralize } from '@/lib/utils'

export interface DataTableColumn<T> {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  sortable?: boolean
  sortValue?: (row: T) => string | number
  align?: 'left' | 'center' | 'right'
  className?: string
  hideable?: boolean
  defaultVisible?: boolean
}

export interface DataTableToolbarProps {
  search?: {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
  }
  filters?: React.ReactNode
  actions?: React.ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  keyField: (row: T) => string
  toolbar?: DataTableToolbarProps
  /** Enable internal pagination */
  pagination?: { pageSize: number; initialPage?: number }
  /** Controlled selection */
  selected?: string[]
  onSelectedChange?: (keys: string[]) => void
  enableSelection?: boolean
  onRowClick?: (row: T) => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  empty?: Omit<EmptyStateProps, 'compact'>
  stickyHeader?: boolean
  columnToggle?: boolean
  className?: string
  tableClassName?: string
  rowClassName?: (row: T) => string
  footer?: React.ReactNode
}

type SortState = { columnId: string; direction: 'asc' | 'desc' } | null

export function DataTable<T>({
  data,
  columns,
  keyField,
  toolbar,
  pagination,
  selected,
  onSelectedChange,
  enableSelection = false,
  onRowClick,
  loading = false,
  error,
  onRetry,
  empty,
  stickyHeader = true,
  columnToggle = true,
  className,
  tableClassName,
  rowClassName,
  footer,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<SortState>(null)
  const [page, setPage] = React.useState(pagination?.initialPage ?? 1)
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.filter((column) => column.defaultVisible !== false).map((column) => [column.id, true])),
  )
  const [internalSelected, setInternalSelected] = React.useState<string[]>([])

  const isControlledSelection = selected !== undefined
  const selectedKeys = isControlledSelection ? selected : internalSelected

  const setSelectedKeys = React.useCallback(
    (keys: string[]) => {
      if (isControlledSelection) onSelectedChange?.(keys)
      else setInternalSelected(keys)
    },
    [isControlledSelection, onSelectedChange],
  )

  React.useEffect(() => {
    if (columns.length === 0) return
    setVisibleColumns((current) => {
      const next = { ...current }
      let changed = false
      for (const column of columns) {
        if (next[column.id] === undefined) {
          next[column.id] = column.defaultVisible !== false
          changed = true
        }
      }
      return changed ? next : current
    })
  }, [columns])

  const sorted = React.useMemo(() => {
    if (!sort) return data
    const column = columns.find((candidate) => candidate.id === sort.columnId)
    const getter = column?.sortValue
    if (!column || !getter) return data
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const av = getter(a)
      const bv = getter(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return String(av).localeCompare(String(bv)) * factor
    })
  }, [data, sort, columns])

  const pageSize = pagination?.pageSize
  const totalPages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1
  const safePage = Math.min(page, totalPages)
  const visibleRows = pageSize ? sorted.slice((safePage - 1) * pageSize, safePage * pageSize) : sorted

  const allKeys = visibleRows.map(keyField)
  const allSelected = allKeys.length > 0 && allKeys.every((key) => selectedKeys.includes(key))
  const someSelected = allKeys.some((key) => selectedKeys.includes(key)) && !allSelected

  const toggleAll = () => {
    const next = new Set(selectedKeys)
    if (allSelected) {
      allKeys.forEach((key) => next.delete(key))
    } else {
      allKeys.forEach((key) => next.add(key))
    }
    setSelectedKeys([...next])
  }

  const toggleRow = (key: string) => {
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelectedKeys([...next])
  }

  const toggleSort = (columnId: string) => {
    setSort((current) => {
      if (current?.columnId !== columnId) return { columnId, direction: 'asc' }
      if (current.direction === 'asc') return { columnId, direction: 'desc' }
      return null
    })
  }

  const pageStart = pageSize ? (safePage - 1) * pageSize + 1 : 1
  const pageEnd = pageSize ? Math.min(safePage * pageSize, sorted.length) : sorted.length

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {(toolbar || columnToggle) && (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {toolbar?.search && <DataTableSearch {...toolbar.search} />}
            {toolbar?.filters}
          </div>
          <div className="flex items-center gap-2">
            {toolbar?.actions}
            {columnToggle && <ColumnToggleMenu columns={columns} visible={visibleColumns} onChange={setVisibleColumns} />}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div className={cn('overflow-x-auto', stickyHeader && 'max-h-[640px] overflow-y-auto')}>
          <Table className={cn(tableClassName, stickyHeader && 'border-collapse')}>
            <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-border)]')}>
              <TableRow className="hover:bg-transparent">
                {enableSelection && (
                  <TableHead className="w-10 px-3">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleAll}
                      aria-label="Select all rows"
                      disabled={visibleRows.length === 0}
                    />
                  </TableHead>
                )}
                {columns
                  .filter((column) => visibleColumns[column.id])
                  .map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        'whitespace-nowrap',
                        column.align === 'right' && 'text-right',
                        column.align === 'center' && 'text-center',
                        column.sortable && 'cursor-pointer select-none hover:text-foreground',
                        column.className,
                      )}
                      aria-sort={
                        sort?.columnId === column.id
                          ? sort.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      {column.sortable ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 uppercase tracking-wide"
                          onClick={() => toggleSort(column.id)}
                        >
                          {column.header}
                          {sort?.columnId === column.id ? (
                            sort.direction === 'asc' ? (
                              <ChevronUp className="size-3.5" />
                            ) : (
                              <ChevronDown className="size-3.5" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + (enableSelection ? 1 : 0)} className="p-0">
                    <TableSkeleton rows={Math.min(pageSize ?? 5, 6)} cols={columns.length} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + (enableSelection ? 1 : 0)}>
                    <ErrorState compact onRetry={onRetry} description={error} />
                  </TableCell>
                </TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + (enableSelection ? 1 : 0)}>
                    <EmptyState
                      compact
                      title={empty?.title ?? 'No results found'}
                      description={empty?.description ?? 'Try adjusting your search or filters.'}
                      icon={empty?.icon}
                      action={empty?.action}
                      secondaryAction={empty?.secondaryAction}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => {
                  const key = keyField(row)
                  const isSelected = selectedKeys.includes(key)
                  return (
                    <TableRow
                      key={key}
                      data-state={isSelected ? 'selected' : undefined}
                      className={cn(
                        onRowClick && 'cursor-pointer',
                        rowClassName?.(row),
                        isSelected && 'bg-primary-soft/40 hover:bg-primary-soft/60',
                      )}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {enableSelection && (
                        <TableCell className="w-10 px-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(key)}
                            aria-label="Select row"
                            onClick={(event) => event.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {columns
                        .filter((column) => visibleColumns[column.id])
                        .map((column) => (
                          <TableCell
                            key={column.id}
                            className={cn(
                              column.align === 'right' && 'text-right',
                              column.align === 'center' && 'text-center',
                              column.className,
                            )}
                          >
                            {column.cell(row)}
                          </TableCell>
                        ))}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {footer && <div className="border-t border-border px-4 py-3">{footer}</div>}
      </div>

      {pagination && !loading && !error && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted-foreground">
            {enableSelection && selectedKeys.length > 0 ? (
              <>
                <span className="font-medium text-foreground">{pluralize(selectedKeys.length, 'row')}</span> selected
                <span className="mx-2 text-border-strong">|</span>
              </>
            ) : null}
            Showing <span className="font-medium text-foreground">{pageStart}</span>–
            <span className="font-medium text-foreground">{pageEnd}</span> of{' '}
            <span className="font-medium text-foreground">{sorted.length}</span>
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  aria-label="Previous page"
                  disabled={safePage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft className="size-4" />
                </PaginationLink>
              </PaginationItem>
              {paginationPages(safePage, totalPages).map((item, index) =>
                item === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <span className="flex size-8 items-center justify-center text-[13px] text-muted-foreground">…</span>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink active={item === safePage} onClick={() => setPage(item)}>
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationLink
                  aria-label="Next page"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  <ChevronRight className="size-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

function DataTableSearch({
  value,
  onValueChange,
  placeholder = 'Search…',
}: NonNullable<DataTableToolbarProps['search']>) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value)
        }}
        placeholder={placeholder}
        aria-label="Search table"
        className="h-10 w-full rounded-xl border border-input bg-surface pl-9 pr-3.5 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/70 hover:border-border-strong focus-visible:border-ring-focus/60 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
      />
    </div>
  )
}

function ColumnToggleMenu<T>({
  columns,
  visible,
  onChange,
}: {
  columns: DataTableColumn<T>[]
  visible: Record<string, boolean>
  onChange: (next: Record<string, boolean>) => void
}) {
  const toggleable = columns.filter((column) => column.hideable !== false)
  if (toggleable.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="md" className="h-10">
          <Columns3 aria-hidden="true" />
          Columns
          <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {toggleable.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visible[column.id] ?? false}
            onCheckedChange={(checked) => onChange({ ...visible, [column.id]: checked })}
          >
            {column.header}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-0"
          aria-hidden="true"
        >
          {Array.from({ length: Math.min(cols, 6) }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" style={{ width: `${70 + ((rowIndex + colIndex) % 4) * 8}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function paginationPages(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total]
  if (current >= total - 3) return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total]
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
}

export function FilterButton({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Button variant={active ? 'default' : 'outline'} size="sm" onClick={onClick} className="h-8 rounded-lg px-3">
      <SlidersHorizontal className="size-3.5" aria-hidden="true" />
      {label}
    </Button>
  )
}