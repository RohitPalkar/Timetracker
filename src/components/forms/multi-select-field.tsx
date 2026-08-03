import { Controller, type Control, type FieldValues } from 'react-hook-form'
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select'
import { FormField, type FormFieldProps } from '@/components/forms/form-field'

export interface MultiSelectFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'children'> {
  control: Control<T>
  options: MultiSelectOption[]
  placeholder?: string
  disabled?: boolean
}

export function MultiSelectField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  hint,
  className,
  options,
  placeholder,
  disabled,
}: MultiSelectFieldProps<T>) {
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
          <MultiSelect
            value={Array.isArray(field.value) ? field.value : []}
            onValueChange={field.onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
          />
        </FormField>
      )}
    />
  )
}