import { Controller, type Control, type FieldValues } from 'react-hook-form'
import { RichTextEditor } from '@/components/forms/rich-text-editor'
import { FormField, type FormFieldProps } from '@/components/forms/form-field'

export interface RichTextFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'children'> {
  control: Control<T>
  placeholder?: string
  disabled?: boolean
  minHeight?: number
}

export function RichTextField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  description,
  hint,
  className,
  placeholder,
  disabled,
  minHeight,
}: RichTextFieldProps<T>) {
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
          <RichTextEditor
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            minHeight={minHeight}
          />
        </FormField>
      )}
    />
  )
}