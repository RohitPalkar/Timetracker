import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

let anon: SupabaseClient | null = null
let service: SupabaseClient | null = null

export function getSupabaseAnon(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null
  if (!anon) anon = createClient(env.supabaseUrl, env.supabaseAnonKey)
  return anon
}

export function getSupabaseService(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null
  if (!service) service = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
  return service
}

export function isSupabaseEnabled(): boolean {
  return env.isSupabaseConfigured()
}
