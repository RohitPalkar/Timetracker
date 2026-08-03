import { Controller, type Control, type FieldValues } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField, type FormFieldProps } from '@/components/forms/form-field'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'children'> {
  control: Control<T>
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  hint,
  className,
  options,
  placeholder = 'Select…',
  disabled,
}: SelectFieldProps<T>) {
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
          <Select value={field.value || undefined} onValueChange={field.onChange} disabled={disabled}>
            <SelectTrigger aria-invalid={fieldState.invalid} aria-describedby={fieldState.error ? `${name}-error` : undefined}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  )
}