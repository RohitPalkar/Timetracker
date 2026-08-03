import { Controller, type Control, type FieldValues } from 'react-hook-form'
import { Switch } from '@/components/ui/switch'
import { FormField, type FormFieldProps } from '@/components/forms/form-field'

export interface SwitchFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'children'> {
  control: Control<T>
  disabled?: boolean
}

export function SwitchField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  hint,
  className,
  disabled,
}: SwitchFieldProps<T>) {
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
          <div className="flex items-center">
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            />
          </div>
        </FormField>
      )}
    />
  )
}