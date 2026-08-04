import * as React from 'react'
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
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
  /** Values matched by the global search box (OR semantics). */
  searchValue?: (row: T) => string | Array<string | number> | undefined
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

interface ColumnMeta {
  align?: 'left' | 'center' | 'right'
  className?: string
}

type SearchAccessor<T> = (row: T) => string | Array<string | number> | undefined

function multiSearch<T>(
  row: { original: T },
  term: string,
  accessors: Array<SearchAccessor<T>>,
): boolean {
  const query = term.trim().toLowerCase()
  if (!query) return true
  return accessors.some((accessor) => {
    const value = accessor(row.original)
    if (Array.isArray(value)) return value.some((part) => String(part).toLowerCase().includes(query))
    return String(value ?? '').toLowerCase().includes(query)
  })
}

export function DataTable<T>({
  data,
  columns: columnConfig,
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
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [searchValue, setSearchValue] = React.useState(toolbar?.search?.value ?? '')
  const [pageIndex, setPageIndex] = React.useState((pagination?.initialPage ?? 1) - 1)
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
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

  const columns = React.useMemo<ColumnDef<T, unknown>[]>(
    () =>
      columnConfig.map((column) => ({
        id: column.id,
        accessorFn: (row: T) => row as unknown,
        header: column.header as ColumnDef<T, unknown>['header'],
        cell: ({ row }) => column.cell(row.original),
        enableSorting: Boolean(column.sortable),
        sortingFn: column.sortValue
          ? (rowA, rowB) => {
              const a = column.sortValue!(rowA.original)
              const b = column.sortValue!(rowB.original)
              if (typeof a === 'number' && typeof b === 'number') return a - b
              return String(a).localeCompare(String(b))
            }
          : undefined,
        meta: {
          align: column.align,
          className: column.className,
        } satisfies ColumnMeta,
      })),
    [columnConfig],
  )

  const searchAccessors = React.useMemo<Array<SearchAccessor<T>>>(
    () => columnConfig.filter((column) => column.searchValue).map((column) => column.searchValue!),
    [columnConfig],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      pagination: pagination ? { pageIndex, pageSize: pagination.pageSize } : undefined,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row) => keyField(row),
    globalFilterFn: (row, _columnId, term) => multiSearch(row, term, searchAccessors),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: searchAccessors.length > 0 ? getFilteredRowModel() : undefined,
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    autoResetPageIndex: false,
  })

  const visibleRows = table.getRowModel().rows
  const totalRows = table.getFilteredRowModel().rows.length
  const totalPages = pagination ? Math.max(1, table.getPageCount()) : 1
  const safePage = pagination ? Math.min(pageIndex + 1, totalPages) : 1

  const allKeys = visibleRows.map((row) => row.id)
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

  const pageStart = pagination ? safePage * pagination.pageSize - pagination.pageSize + 1 : 1
  const pageEnd = pagination ? Math.min(safePage * pagination.pageSize, totalRows) : totalRows

  const handleSearch = (value: string) => {
    setSearchValue(value)
    setGlobalFilter(value)
    toolbar?.search?.onValueChange(value)
    setPageIndex(0)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {(toolbar || columnToggle) && (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {toolbar?.search && (
              <DataTableSearch value={searchValue} onValueChange={handleSearch} placeholder={toolbar.search.placeholder} />
            )}
            {toolbar?.filters}
          </div>
          <div className="flex items-center gap-2">
            {toolbar?.actions}
            {columnToggle && (
              <ColumnToggleMenu
                columns={columnConfig}
                visibility={table.getState().columnVisibility}
                onToggle={(columnId) =>
                  table.setColumnVisibility((previous) => ({
                    ...previous,
                    [columnId]: previous[columnId] === false ? true : false,
                  }))
                }
              />
            )}
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
                {table.getVisibleLeafColumns().map((column) => {
                  const meta = column.columnDef.meta as ColumnMeta | undefined
                  const isSorted = column.getIsSorted()
                  return (
                    <TableHead
                      key={column.id}
                      className={cn(
                        'whitespace-nowrap',
                        meta?.align === 'right' && 'text-right',
                        meta?.align === 'center' && 'text-center',
                        column.getCanSort() && 'cursor-pointer select-none hover:text-foreground',
                        meta?.className,
                      )}
                      aria-sort={
                        isSorted === 'asc' ? 'ascending' : isSorted === 'desc' ? 'descending' : undefined
                      }
                    >
                      {column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 uppercase tracking-wide"
                          onClick={column.getToggleSortingHandler()}
                        >
                          {column.columnDef.header as React.ReactNode}
                          {isSorted === 'asc' ? (
                            <ChevronUp className="size-3.5" />
                          ) : isSorted === 'desc' ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        (column.columnDef.header as React.ReactNode)
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={table.getAllLeafColumns().length + (enableSelection ? 1 : 0)} className="p-0">
                    <TableSkeleton rows={Math.min(pagination?.pageSize ?? 5, 6)} cols={table.getAllLeafColumns().length} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={table.getAllLeafColumns().length + (enableSelection ? 1 : 0)}>
                    <ErrorState compact onRetry={onRetry} description={error} />
                  </TableCell>
                </TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={table.getAllLeafColumns().length + (enableSelection ? 1 : 0)}>
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
                  const key = row.id
                  const isSelected = selectedKeys.includes(key)
                  return (
                    <TableRow
                      key={key}
                      data-state={isSelected ? 'selected' : undefined}
                      className={cn(
                        onRowClick && 'cursor-pointer',
                        rowClassName?.(row.original),
                        isSelected && 'bg-primary-soft/40 hover:bg-primary-soft/60',
                      )}
                      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
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
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as ColumnMeta | undefined
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              meta?.align === 'right' && 'text-right',
                              meta?.align === 'center' && 'text-center',
                              meta?.className,
                            )}
                          >
                            {cell.getValue() as React.ReactNode}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {footer && <div className="border-t border-border px-4 py-3">{footer}</div>}
      </div>

      {pagination && !loading && !error && totalPages > 1 && (
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
            <span className="font-medium text-foreground">{totalRows}</span>
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  aria-label="Previous page"
                  disabled={safePage <= 1}
                  onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
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
                    <PaginationLink
                      active={item === safePage}
                      onClick={() => setPageIndex(item - 1)}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationLink
                  aria-label="Next page"
                  disabled={safePage >= totalPages}
                  onClick={() => setPageIndex((current) => Math.min(totalPages - 1, current + 1))}
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
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search table"
        className="h-10 w-full rounded-xl border border-input bg-surface pl-9 pr-3.5 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/70 hover:border-border-strong focus-visible:border-ring-focus/60 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
      />
    </div>
  )
}

function ColumnToggleMenu<T>({
  columns,
  visibility,
  onToggle,
}: {
  columns: DataTableColumn<T>[]
  visibility: Record<string, boolean>
  onToggle: (columnId: string) => void
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
            checked={visibility[column.id] !== false}
            onCheckedChange={() => onToggle(column.id)}
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