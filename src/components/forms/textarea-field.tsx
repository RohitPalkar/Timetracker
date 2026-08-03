import { Controller, type Control, type FieldValues } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { FormField, type FormFieldProps } from '@/components/forms/form-field'

export interface TextareaFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'children'> {
  control: Control<T>
  placeholder?: string
  disabled?: boolean
  rows?: number
}

export function TextareaField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  hint,
  className,
  placeholder,
  disabled,
  rows,
}: TextareaFieldProps<T>) {
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
          <Textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.error ? `${name}-error` : undefined}
          />
        </FormField>
      )}
    />
  )
}