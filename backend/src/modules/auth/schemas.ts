import { z } from 'zod'

export const requestOtpSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase()),
})

export const verifyOtpSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  code: z.string().min(6).max(10).transform(v => v.replace(/\D/g, '').trim()),
})

export const verifyOtpQuerySchema = z.object({
  email: z.string().optional(),
  code: z.string().optional(),
})
