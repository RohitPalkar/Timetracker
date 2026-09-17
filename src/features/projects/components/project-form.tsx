import { useForm, type Resolver } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/forms/text-field'
import { TextareaField } from '@/components/forms/textarea-field'
import { SelectField } from '@/components/forms/select-field'
import { DateField } from '@/components/forms/date-field'
import { MultiSelectField } from '@/components/forms/multi-select-field'
import { Separator } from '@/components/ui/separator'
import type { User } from '@/types'
import { PROJECT_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS, projectFormSchema, type ProjectFormDefaultValues, type ProjectFormValues } from '../project-form-schema'

export interface ProjectFormProps {
  defaultValues: ProjectFormDefaultValues
  users: User[]
  /** Users who may act as project manager — falls back to `users` when omitted. */
  eligibleManagers?: User[]
  submitLabel: string
  submitting?: boolean
  /** Called on cancel; the form is always reset to defaultValues. */
  onCancel?: () => void
  onSubmit: (values: ProjectFormValues) => void
}

const userOptions = (users: User[]) => users.map((user) => ({ value: user.id, label: user.name }))

/**
 * Shared create/edit form — rendered inside the New/Edit project drawer
 * and inside the Settings tab. Never duplicated.
 */
export function ProjectForm({ defaultValues, users, eligibleManagers, submitLabel, submitting, onCancel, onSubmit }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: standardSchemaResolver(projectFormSchema) as unknown as Resolver<ProjectFormValues>,
    defaultValues,
  })

  const handleCancel = () => {
    form.reset(defaultValues)
    onCancel?.()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          control={form.control}
          name="name"
          label="Project name"
          required
          placeholder="e.g. Acme Customer Portal"
          className="sm:col-span-2"
          autoFocus
        />
        <TextField
          control={form.control}
          name="key"
          label="Project code"
          description="Unique charge code; doubles as the board key prefix on tickets."
          placeholder="e.g. PORTAL"
          required
        />
        <SelectField
          control={form.control}
          name="type"
          label="Project type"
          description="Category in the MyTracker project model."
          options={PROJECT_TYPE_OPTIONS}
          placeholder="Select a type…"
        />
        <TextField control={form.control} name="client" label="Client" placeholder="e.g. Orbit Retail" />
        <SelectField
          control={form.control}
          name="status"
          label="Status"
          options={PROJECT_STATUS_OPTIONS}
        />
        <MultiSelectField
          control={form.control}
          name="managerIds"
          label="Project managers"
          required
          options={userOptions(eligibleManagers ?? users)}
          placeholder="Select managers…"
        />
        <SelectField
          control={form.control}
          name="businessAnalystId"
          label="Business analyst"
          options={userOptions(users)}
          placeholder="Select a BA…"
        />
        <TextField
          control={form.control}
          name="budget"
          label="Budget"
          type="number"
          placeholder="0"
          leftSlot={<span className="text-xs font-medium text-muted-foreground">$</span>}
          required
        />
        <DateField control={form.control} name="startDate" label="Start date" required />
        <DateField
          control={form.control}
          name="endDate"
          label="End date"
          description="Optional — defaults to 90 days after the start date."
          className="sm:col-span-2"
        />
      </div>

      <TextareaField
        control={form.control}
        name="description"
        label="Description"
        placeholder="What is this project about?"
        rows={3}
      />

      <Separator />

      <MultiSelectField
        control={form.control}
        name="teamMemberIds"
        label="Team members"
        description="Developers, QA, designers and others working on this project."
        options={userOptions(users)}
        placeholder="Add team members…"
      />

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
