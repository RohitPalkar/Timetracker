import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(['development','qa','design','business_analysis','devops','cross_functional']).default('cross_functional'),
  member_ids: z.array(z.string().uuid()).optional().default([]),
})

export const updateTeamSchema = createTeamSchema.partial()
