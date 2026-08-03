import * as React from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FileFieldValue {
  name: string
  size: number
  type: string
}

export interface FileFieldProps {
  label?: React.ReactNode
  required?: boolean
  description?: React.ReactNode
  hint?: React.ReactNode
  error?: string
  className?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  onFiles?: (files: FileList) => void
  selected?: FileFieldValue[]
}

/** File picker with drag & drop affordance and selected-file summary. */
export function FileField({
  label,
  required,
  description,
  hint,
  error,
  className,
  accept,
  multiple = true,
  disabled,
  onFiles,
  selected = [],
}: FileFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="flex items-center gap-1 text-[13px] font-medium text-foreground">
          {label}
          {required && (
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          )}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (event.dataTransfer.files.length > 0) onFiles?.(event.dataTransfer.files)
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-muted px-4 py-8 text-center transition-colors',
          dragging && 'border-primary bg-primary-soft',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-surface text-muted-foreground shadow-xs">
          <UploadCloud className="size-5" aria-hidden="true" />
        </span>
        <span className="text-[13px] font-medium text-foreground">Drag &amp; drop or browse</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </button>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          if (event.currentTarget.files && event.currentTarget.files.length > 0) {
            onFiles?.(event.currentTarget.files)
          }
          event.currentTarget.value = ''
        }}
        aria-label={typeof label === 'string' ? label : 'Upload files'}
      />

      {selected.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {selected.map((file) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px]"
            >
              <span className="min-w-0 truncate font-medium text-foreground">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatBytes(file.size)}
                <span className="mx-1 text-border-strong">|</span>
                {file.type.split('/')[1] || 'file'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}