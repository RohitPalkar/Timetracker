import { z } from 'zod'
import type { ProjectStatus } from '@/types'

export const PROJECT_STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'planned', label: 'Planned' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const PROJECT_STATUSES = PROJECT_STATUS_OPTIONS.map((option) => option.value)

export const projectFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Project name is required').max(120, 'Keep it under 120 characters'),
    key: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9][A-Za-z0-9-]{0,9}$/, '2–10 characters: letters, numbers, dashes')
      .or(z.literal(''))
      .optional(),
    client: z.string().trim().max(80, 'Keep it under 80 characters').optional(),
    description: z.string().trim().max(1000, 'Keep it under 1000 characters').optional(),
    ownerId: z.string().min(1, 'Select a project manager'),
    businessAnalystId: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    budget: z.coerce
      .number({ message: 'Budget must be a number' })
      .min(0, 'Budget cannot be negative')
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
