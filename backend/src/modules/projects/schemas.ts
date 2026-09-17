import { z } from 'zod'

export const createProjectSchema = z.object({
  key: z.string().min(1).max(20).transform(v => v.trim().toUpperCase()),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['active','planned','completed','archived','on_hold']).default('active'),
  health: z.enum(['healthy','on_track','at_risk','critical']).default('healthy'),
  type: z.enum(['platform','product','client_delivery','internal','data','design']).optional().nullable(),
  client: z.string().max(200).optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  budget: z.number().min(0).optional().default(0),
  spent: z.number().min(0).optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  manager_ids: z.array(z.string().uuid()).optional().default([]),
  member_ids: z.array(z.object({ user_id: z.string().uuid(), role: z.enum(['owner','manager','lead','developer','qa','designer','business_analyst','consultant']).default('developer') })).optional().default([]),
  has_sub_projects: z.boolean().optional().default(false),
})

export const updateProjectSchema = createProjectSchema.partial().extend({
  key: z.string().min(1).max(20).transform(v => v.trim().toUpperCase()).optional(),
})

export const createSubProjectSchema = z.object({
  key: z.string().min(1).max(20).transform(v => v.trim().toUpperCase()),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['active','planned','completed','archived','on_hold']).default('active'),
  health: z.enum(['healthy','on_track','at_risk','critical']).default('healthy'),
  budget: z.number().min(0).optional().default(0),
  spent: z.number().min(0).optional().default(0),
  tags: z.array(z.string()).optional().default([]),
})

export const addMemberSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['owner','manager','lead','developer','qa','designer','business_analyst','consultant']).default('developer'),
  capacity: z.number().min(0).max(100).optional().default(100),
})
