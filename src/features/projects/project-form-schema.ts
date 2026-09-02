import { z } from 'zod'
import type { ProjectStatus, ProjectType } from '@/types'

export const PROJECT_STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'planned', label: 'Planned' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const PROJECT_STATUSES = PROJECT_STATUS_OPTIONS.map((option) => option.value)

export const PROJECT_TYPE_OPTIONS: Array<{ value: ProjectType; label: string }> = [
  { value: 'platform', label: 'Platform' },
  { value: 'product', label: 'Product' },
  { value: 'client_delivery', label: 'Client delivery' },
  { value: 'internal', label: 'Internal' },
  { value: 'data', label: 'Data & analytics' },
  { value: 'design', label: 'Design system' },
]

const PROJECT_TYPES = PROJECT_TYPE_OPTIONS.map((option) => option.value)

export const projectFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Project name is required').max(120, 'Keep it under 120 characters'),
    key: z
      .string()
      .trim()
      .min(2, 'Project code is required (2–10 characters)')
      .regex(/^[A-Za-z0-9][A-Za-z0-9-]{0,9}$/, 'Use 2–10 letters, numbers, or dashes'),
    client: z.string().trim().max(80, 'Keep it under 80 characters').optional(),
    type: z.enum(PROJECT_TYPES).default('platform'),
    description: z.string().trim().max(1000, 'Keep it under 1000 characters').optional(),
    ownerId: z.string().min(1, 'Select a project manager'),
    businessAnalystId: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    budget: z.coerce
      .number({ message: 'Budget must be a number' })
      .gt(0, 'Budget must be greater than zero')
      .max(100_000_000, 'Budget is too large'),
    status: z.enum(PROJECT_STATUSES),
    teamMemberIds: z.array(z.string()).default([]),
  })
  .superRefine((values, context) => {
    if (values.endDate && values.startDate && values.endDate < values.startDate) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date must be on or after the start date',
      })
    }
  })

export type ProjectFormValues = z.infer<typeof projectFormSchema>
export type ProjectFormDefaultValues = Partial<ProjectFormValues>
