import * as React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Kbd } from '@/components/navigation/kbd'

export interface SearchBoxProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  shortcut?: string
  className?: string
  icon?: boolean
  clearable?: boolean
}

export function SearchBox({
  value,
  onValueChange,
  placeholder = 'Search…',
  shortcut,
  className,
  icon = true,
  ...props
}: SearchBoxProps) {
  return (
    <div className={cn('relative', className)}>
      {icon && (
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <Input
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
        placeholder={placeholder}
        className={cn('pl-9', shortcut && 'pr-14')}
        aria-label={props['aria-label'] ?? placeholder}
        {...props}
      />
      {shortcut && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <Kbd>{shortcut}</Kbd>
        </span>
      )}
    </div>
  )
}