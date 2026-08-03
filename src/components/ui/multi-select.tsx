import * as React from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface MultiSelectProps {
  value: string[]
  onValueChange: (value: string[]) => void
  options: MultiSelectOption[]
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  selectAllLabel?: string
  clearLabel?: string
}

export function MultiSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  emptyText = 'No matching options',
  disabled,
  className,
  selectAllLabel = 'Select all',
  clearLabel = 'Clear',
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const selected = React.useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, query])

  const toggle = (optionValue: string) => {
    onValueChange(value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            'flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-surface px-3.5 py-1.5 text-sm shadow-xs transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {selected.length === 0 ? (
              <span className="py-1 text-muted-foreground">{placeholder}</span>
            ) : (
              selected.slice(0, 4).map((option) => (
                <Badge key={option.value} variant="surface" className="gap-1 py-0.5 pr-1 pl-2">
                  {option.icon}
                  {option.label}
                  <button
                    type="button"
                    aria-label={`Remove ${option.label}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggle(option.value)
                    }}
                    className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            )}
            {selected.length > 4 && <Badge variant="neutral">+{selected.length - 4} more</Badge>}
          </div>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0" sideOffset={4}>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search…"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search options"
          />
        </div>
        <ul role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
          ) : (
            filtered.map((option) => {
              const isSelected = value.includes(option.value)
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => toggle(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded-[4px] border transition-colors',
                        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <button
              type="button"
              onClick={() => onValueChange(filtered.map((option) => option.value))}
              className="text-[13px] font-medium text-primary hover:underline"
            >
              {selectAllLabel}
            </button>
            <button
              type="button"
              onClick={() => onValueChange([])}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
              {clearLabel}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}