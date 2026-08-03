import * as React from 'react'
import { Controller, type Control, type FieldValues } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { FormField, type FormFieldProps } from '@/components/forms/form-field'

export interface TextFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'children'> {
  control: Control<T>
  type?: 'text' | 'email' | 'number' | 'password' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  autoComplete?: string
  autoFocus?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
}

export function TextField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  hint,
  className,
  type = 'text',
  placeholder,
  disabled,
  autoComplete,
  autoFocus,
  inputMode,
  leftSlot,
  rightSlot,
}: TextFieldProps<T>) {
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
            {leftSlot && (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {leftSlot}
              </span>
            )}
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              inputMode={inputMode}
              className={leftSlot ? 'pl-9' : rightSlot ? 'pr-9' : undefined}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error ? `${name}-error` : undefined}
            />
            {rightSlot && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {rightSlot}
              </span>
            )}
          </div>
        </FormField>
      )}
    />
  )
}