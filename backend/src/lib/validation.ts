import { z } from 'zod'
import { ApiError } from './errors.js'

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const res = schema.safeParse(data)
  if (!res.success) {
    const msg = res.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    throw new ApiError(msg || 'Validation failed', 400, 'VALIDATION_ERROR')
  }
  return res.data
}
