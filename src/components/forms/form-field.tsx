import * as React from 'react'
import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface FormFieldProps<T extends FieldValues> {
  name: Path<T>
  label?: React.ReactNode
  required?: boolean
  description?: React.ReactNode
  error?: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Visual wrapper: label + description + children + inline error. */
export function FormField<T extends FieldValues>({
  label,
  required,
  description,
  error,
  hint,
  className,
  children,
}: FormFieldProps<T>) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && (
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

/** Minimal metadata shared by all controlled fields. */
export interface FieldMeta<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>
  error?: string
}

export function ariaInvalid<T extends FieldValues>(field: ControllerRenderProps<T, Path<T>>, error?: string) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${field.name}-error` : undefined,
  }
}