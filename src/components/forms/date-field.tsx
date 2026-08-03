import { Controller, type Control, type FieldValues } from 'react-hook-form'
import { Calendar } from 'lucide-react'
import { FormField, type FormFieldProps } from '@/components/forms/form-field'
import { cn } from '@/lib/utils'

export interface DateFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'children'> {
  control: Control<T>
  disabled?: boolean
  min?: string
  max?: string
}

/**
 * Native date input, styled to the design system.
 * Swapped to React Day Picker once calendar pickers are required.
 */
export function DateField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  hint,
  className,
  disabled,
  min,
  max,
}: DateFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField<T>
          name={name}
          label={label}
          required={required}
          description={description}
          hint={hint}
          error={fieldState.error?.message}
          className={className}
        >
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              {...field}
              type="date"
              min={min}
              max={max}
              disabled={disabled}
              className={cn(
                'h-10 w-full rounded-xl border border-input bg-surface pl-9 pr-3.5 text-sm text-foreground shadow-xs transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger',
                'dark:[color-scheme:dark]',
              )}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error ? `${name}-error` : undefined}
            />
          </div>
        </FormField>
      )}
    />
  )
}